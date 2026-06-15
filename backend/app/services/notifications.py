"""Entrega de notificações e alertas.

Três camadas de entrega:

* ``voice`` — falado pela própria Ana no dispositivo do idoso (lembretes
  rotineiros). Em produção isto é roteado para o canal de áudio do
  Vertex AI Live API.
* ``sms`` / ``call`` — alertas críticos para os contatos de emergência via
  Twilio.

Toda notificação é registrada na coleção ``notifications`` para auditoria e
para alimentar o dashboard dos familiares.
"""

from __future__ import annotations

import logging
from datetime import datetime

from ..config import get_settings
from ..repository import get_repository
from ..schemas import NotificationChannel, NotificationStatus

logger = logging.getLogger("ana.notifications")


def _record(user_id: str, channel: str, body: str, *, to=None, critical=False,
            status=NotificationStatus.sent) -> str:
    repo = get_repository()
    return repo.add_notification(
        {
            "userId": user_id,
            "channel": channel,
            "to": to,
            "body": body,
            "status": status.value,
            "critical": critical,
            "createdAt": datetime.utcnow(),
        }
    )


def deliver_voice(user_id: str, body: str) -> str:
    """Fala uma mensagem rotineira para o idoso (lembrete não crítico)."""
    logger.info("[VOICE → %s] %s", user_id, body)
    # TODO(produção): empurrar `body` para a sessão Vertex AI Live API ativa.
    return _record(user_id, NotificationChannel.voice.value, body)


def _twilio_client():
    settings = get_settings()
    if not settings.use_twilio:
        return None
    from twilio.rest import Client  # import tardio

    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def deliver_sms(user_id: str, to: str, body: str, *, critical: bool = True) -> str:
    settings = get_settings()
    client = _twilio_client()
    if client is None:
        logger.warning("[SMS stub → %s] %s", to, body)
        return _record(user_id, NotificationChannel.sms.value, body, to=to,
                       critical=critical)
    try:
        client.messages.create(to=to, from_=settings.twilio_from_number, body=body)
        status = NotificationStatus.sent
    except Exception:  # pragma: no cover - depende de rede externa
        logger.exception("Falha ao enviar SMS para %s", to)
        status = NotificationStatus.failed
    return _record(user_id, NotificationChannel.sms.value, body, to=to,
                   critical=critical, status=status)


def deliver_call(user_id: str, to: str, body: str) -> str:
    settings = get_settings()
    client = _twilio_client()
    if client is None:
        logger.warning("[CALL stub → %s] %s", to, body)
        return _record(user_id, NotificationChannel.call.value, body, to=to,
                       critical=True)
    try:
        twiml = f"<Response><Say language='pt-BR'>{body}</Say></Response>"
        client.calls.create(to=to, from_=settings.twilio_from_number, twiml=twiml)
        status = NotificationStatus.sent
    except Exception:  # pragma: no cover
        logger.exception("Falha ao ligar para %s", to)
        status = NotificationStatus.failed
    return _record(user_id, NotificationChannel.call.value, body, to=to,
                   critical=True, status=status)


def alert_emergency_contacts(user_id: str, user_data: dict, body: str,
                             *, call: bool = True) -> list[str]:
    """Dispara SMS (e opcionalmente chamada) para todos os contatos de
    emergência do usuário. Usado por sentinela, geofencing e escalonamento
    de medicação."""
    ids: list[str] = []
    for contact in user_data.get("emergencyContacts", []) or []:
        phone = contact.get("phone")
        if not phone:
            continue
        ids.append(deliver_sms(user_id, phone, body))
        if call and contact.get("notifyByCall", True):
            ids.append(deliver_call(user_id, phone, body))
    return ids
