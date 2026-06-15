"""Ações proativas disparadas pelo event loop.

Cada função decide *se* deve falar (respeitando o "Não Perturbe"), entrega a
mensagem pelo canal adequado e registra um ``healthLog`` para auditoria.
"""

from __future__ import annotations

from datetime import datetime

from ..repository import SUB_HEALTH_LOGS, SUB_REMINDERS, get_repository
from ..schemas import HealthCategory, MedicationStatus
from . import notifications
from .dnd import should_deliver


def _log_health(user_id: str, category: HealthCategory, details: dict,
                now: datetime) -> None:
    get_repository().add_subdoc(
        user_id,
        SUB_HEALTH_LOGS,
        {"timestamp": now, "category": category.value, "details": details},
    )


def send_medication_reminder(user_id: str, user_data: dict, med_id: str,
                             med: dict, dose_key: str, now: datetime) -> bool:
    """Lembra uma dose. Cria/atualiza um doc em ``reminders`` para rastrear a
    confirmação. Lembrete de medicação é tratado como crítico (passa pelo DND).
    """
    repo = get_repository()
    reminder_id = f"{med_id}_{now.date().isoformat()}_{dose_key}"
    existing = repo.get_subdoc(user_id, SUB_REMINDERS, reminder_id)
    if existing and existing.get("status") in {"pending", "confirmed", "escalated"}:
        return False  # já lembrado nesta dose

    body = (
        f"Está na hora do seu remédio: {med.get('name')} "
        f"({med.get('dosage')}). {med.get('notes') or ''}".strip()
    )
    # Medicação é prioridade: entrega mesmo em modo Não Perturbe.
    if should_deliver(user_data.get("settings", {}), now, critical=True):
        notifications.deliver_voice(user_id, body)

    repo.add_subdoc(
        user_id, SUB_REMINDERS,
        {
            "medicationId": med_id,
            "doseTime": dose_key,
            "scheduledAt": now,
            "status": MedicationStatus.pending.value,
            "requiresConfirmation": med.get("requiresConfirmation", True),
        },
        doc_id=reminder_id,
    )
    _log_health(user_id, HealthCategory.medication,
                {"medicationId": med_id, "status": MedicationStatus.pending.value}, now)
    return True


def escalate_unconfirmed_medication(user_id: str, user_data: dict,
                                    reminder_id: str, reminder: dict,
                                    now: datetime) -> None:
    """Sem confirmação dentro da janela → avisa a família (crítico)."""
    repo = get_repository()
    body = (
        f"Atenção: {user_data.get('name', 'o idoso')} ainda não confirmou o "
        f"medicamento das {reminder.get('doseTime')}. Por favor, verifique."
    )
    notifications.alert_emergency_contacts(user_id, user_data, body, call=False)
    repo.update_subdoc(user_id, SUB_REMINDERS, reminder_id,
                       {"status": MedicationStatus.missed.value})
    _log_health(user_id, HealthCategory.medication,
                {"medicationId": reminder.get("medicationId"),
                 "status": MedicationStatus.missed.value}, now)


def send_hydration_reminder(user_id: str, user_data: dict, now: datetime) -> bool:
    if not should_deliver(user_data.get("settings", {}), now, critical=False):
        return False
    name = user_data.get("name", "")
    notifications.deliver_voice(
        user_id, f"{name}, já bebeu água? Que tal um copinho agora?".strip())
    return True


def send_meal_reminder(user_id: str, user_data: dict, meal: str,
                       now: datetime) -> bool:
    if not should_deliver(user_data.get("settings", {}), now, critical=False):
        return False
    nomes = {"breakfast": "café da manhã", "lunch": "almoço", "dinner": "jantar"}
    notifications.deliver_voice(
        user_id, f"Está na hora do {nomes.get(meal, meal)}. Vamos comer?")
    return True


def notify_family_geofence_breach(user_id: str, user_data: dict, coords: dict,
                                  now: datetime) -> None:
    """Saída do perímetro seguro → alerta crítico para a família."""
    body = (
        f"Alerta: {user_data.get('name', 'o idoso')} saiu da área segura "
        f"(local atual: {coords.get('lat'):.5f}, {coords.get('lng'):.5f})."
    )
    notifications.alert_emergency_contacts(user_id, user_data, body, call=True)
    _log_health(user_id, HealthCategory.geofence,
                {"status": "outside", "coordinates": coords}, now)


def handle_sentinel_event(user_id: str, user_data: dict, sound_type: str,
                          now: datetime) -> None:
    """Som de queda / pedido de ajuda → emergência imediata."""
    body = (
        f"EMERGÊNCIA: a Ana detectou um som de '{sound_type}' na casa de "
        f"{user_data.get('name', 'o idoso')}. Acione ajuda imediatamente."
    )
    notifications.alert_emergency_contacts(user_id, user_data, body, call=True)
    _log_health(user_id, HealthCategory.sentinel,
                {"soundType": sound_type, "status": "alerted"}, now)
