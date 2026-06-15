"""Event loop proativo da Ana.

Funções de verificação registradas no APScheduler:

* ``check_medications``           — a cada 1 min: dispara doses na janela.
* ``check_medication_escalations``— a cada 1 min: escala doses não confirmadas.
* ``check_hydration_and_meals``   — a cada 5 min: hidratação + refeições.
* ``check_geofence``              — a cada 10 min: perímetro seguro.

Todas aceitam ``now`` opcional (datetime *naive* no fuso local) para permitir
testes determinísticos.
"""

from __future__ import annotations

import logging
from datetime import datetime, time, timedelta
from typing import Optional

from ..clock import local_now as _clock_now
from ..config import get_settings
from ..repository import (
    SUB_LOCATIONS,
    SUB_MEDICATIONS,
    SUB_REMINDERS,
    get_repository,
)
from ..schemas import HealthCategory, MedicationStatus
from ..services import proactive
from ..services.geofence import inside_geofence

logger = logging.getLogger("ana.event_loop")


def local_now() -> datetime:
    """Horário atual (naive) no fuso configurado, truncado ao minuto.

    Usa o relógio central (:mod:`app.clock`) para que o event loop e os
    routers compartilhem a mesma base de tempo.
    """
    return _clock_now().replace(second=0, microsecond=0)


def _parse_hhmm(value: str) -> Optional[time]:
    try:
        hh, mm = value.split(":")
        return time(int(hh), int(mm))
    except (ValueError, AttributeError):
        return None


# --------------------------------------------------------------------------- #
# Medicação
# --------------------------------------------------------------------------- #
def check_medications(now: Optional[datetime] = None) -> int:
    """Dispara lembretes para doses na janela [now, now + lookahead]."""
    now = now or local_now()
    settings = get_settings()
    window_end = now + timedelta(minutes=settings.reminder_lookahead_min)
    repo = get_repository()
    fired = 0

    for user_id, user_data in repo.list_users():
        for med_id, med in repo.list_subdocs(user_id, SUB_MEDICATIONS):
            for scheduled in med.get("schedule", []) or []:
                t = _parse_hhmm(scheduled)
                if t is None:
                    continue
                dose_dt = datetime.combine(now.date(), t)
                if now <= dose_dt <= window_end:
                    if proactive.send_medication_reminder(
                        user_id, user_data, med_id, med, scheduled, now
                    ):
                        fired += 1
    return fired


def check_medication_escalations(now: Optional[datetime] = None) -> int:
    """Escala para a família doses pendentes além da janela de tolerância."""
    now = now or local_now()
    settings = get_settings()
    deadline = timedelta(minutes=settings.medication_escalation_min)
    repo = get_repository()
    escalated = 0

    for user_id, user_data in repo.list_users():
        for rem_id, rem in repo.list_subdocs(user_id, SUB_REMINDERS):
            if rem.get("status") != MedicationStatus.pending.value:
                continue
            if not rem.get("requiresConfirmation", True):
                continue
            scheduled_at = rem.get("scheduledAt")
            if isinstance(scheduled_at, datetime) and now - scheduled_at >= deadline:
                proactive.escalate_unconfirmed_medication(
                    user_id, user_data, rem_id, rem, now
                )
                escalated += 1
    return escalated


# --------------------------------------------------------------------------- #
# Hidratação e refeições
# --------------------------------------------------------------------------- #
def check_hydration_and_meals(now: Optional[datetime] = None) -> int:
    now = now or local_now()
    repo = get_repository()
    actions = 0

    for user_id, user_data in repo.list_users():
        # Hidratação — baseada no último log de hidratação.
        interval = float(user_data.get("hydrationIntervalHours", 2))
        latest = repo.latest_subdoc(
            user_id, "healthLogs",
            where=("category", HealthCategory.hydration.value),
        )
        last_time = latest[1].get("timestamp") if latest else None
        due = last_time is None or (
            isinstance(last_time, datetime)
            and now - last_time >= timedelta(hours=interval)
        )
        if due and proactive.send_hydration_reminder(user_id, user_data, now):
            actions += 1

        # Refeições — janela de lookahead em torno do horário marcado.
        lookahead = timedelta(minutes=get_settings().reminder_lookahead_min)
        for meal, hour in (user_data.get("mealSchedule") or {}).items():
            if not hour:
                continue
            t = _parse_hhmm(hour)
            if t is None:
                continue
            meal_dt = datetime.combine(now.date(), t)
            if now <= meal_dt <= now + lookahead:
                if proactive.send_meal_reminder(user_id, user_data, meal, now):
                    actions += 1
    return actions


# --------------------------------------------------------------------------- #
# Geofencing
# --------------------------------------------------------------------------- #
def check_geofence(now: Optional[datetime] = None) -> int:
    now = now or local_now()
    repo = get_repository()
    breaches = 0

    for user_id, user_data in repo.list_users():
        geofence = user_data.get("geofence") or {}
        if not geofence.get("enabled", False):
            continue
        latest = repo.latest_subdoc(user_id, SUB_LOCATIONS)
        if not latest:
            continue
        loc_id, loc = latest
        coords = loc.get("coordinates")
        if not coords:
            continue
        if inside_geofence(coords, geofence):
            continue
        # Alerta apenas uma vez por episódio de saída: a amostra que já
        # gerou alerta é marcada com ``alerted``; execuções seguintes do job
        # ignoram a mesma amostra até que uma posição "inside" chegue.
        if loc.get("alerted"):
            continue
        proactive.notify_family_geofence_breach(user_id, user_data, coords, now)
        repo.update_subdoc(user_id, SUB_LOCATIONS, loc_id, {"alerted": True})
        breaches += 1
    return breaches


# --------------------------------------------------------------------------- #
# Registro no scheduler
# --------------------------------------------------------------------------- #
def register_jobs(scheduler) -> None:
    s = get_settings()
    scheduler.add_job(check_medications, "interval",
                      minutes=s.medication_check_interval_min, id="medications")
    scheduler.add_job(check_medication_escalations, "interval",
                      minutes=s.medication_check_interval_min, id="med_escalation")
    scheduler.add_job(check_hydration_and_meals, "interval",
                      minutes=s.hydration_check_interval_min, id="hydration_meals")
    scheduler.add_job(check_geofence, "interval",
                      minutes=s.geofence_check_interval_min, id="geofence")
    logger.info("Event loop jobs registrados.")
