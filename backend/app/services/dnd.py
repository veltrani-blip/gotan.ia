"""Modo "Não Perturbe" inteligente.

A Ana respeita janelas de descanso (sono noturno + soneca da tarde). Lembretes
*não urgentes* são suprimidos durante essas janelas; alertas críticos
(emergência, medicação atrasada) sempre passam.
"""

from __future__ import annotations

from datetime import datetime, time


def _parse_hhmm(value: str | None) -> time | None:
    if not value:
        return None
    try:
        hh, mm = value.split(":")
        return time(int(hh), int(mm))
    except (ValueError, AttributeError):
        return None


def _in_window(now_t: time, start: time | None, end: time | None) -> bool:
    if start is None or end is None:
        return False
    if start <= end:
        # Janela no mesmo dia (ex.: 13:00–15:00).
        return start <= now_t < end
    # Janela que cruza a meia-noite (ex.: 22:00–07:00).
    return now_t >= start or now_t < end


def in_do_not_disturb(settings: dict, now: datetime) -> bool:
    """True se ``now`` cai em uma janela de descanso do usuário.

    ``settings`` é o mapa ``settings.doNotDisturb`` do documento do usuário.
    """
    dnd = (settings or {}).get("doNotDisturb", {})
    if not dnd.get("enabled", True):
        return False

    now_t = now.time()
    night = _in_window(
        now_t, _parse_hhmm(dnd.get("start")), _parse_hhmm(dnd.get("end"))
    )
    afternoon = _in_window(
        now_t,
        _parse_hhmm(dnd.get("afternoonStart")),
        _parse_hhmm(dnd.get("afternoonEnd")),
    )
    return night or afternoon


def should_deliver(settings: dict, now: datetime, *, critical: bool) -> bool:
    """Decide se um lembrete deve ser entregue agora.

    Alertas críticos ignoram o "Não Perturbe"; os demais são suprimidos
    durante as janelas de descanso.
    """
    if critical:
        return True
    return not in_do_not_disturb(settings, now)
