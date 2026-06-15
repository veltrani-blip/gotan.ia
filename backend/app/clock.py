"""Relógio único da aplicação.

Todo o sistema (event loop, routers, logs de saúde) usa o mesmo relógio
*naive* no fuso configurado em ``ANA_TIMEZONE``. Isso evita comparar
``datetime.utcnow()`` (UTC) com horários de rotina locais ("08:00"), o que
deslocava intervalos de hidratação/refeição.
"""

from __future__ import annotations

from datetime import datetime

import pytz

from .config import get_settings


def local_now() -> datetime:
    """Horário atual *naive* no fuso configurado (precisão de segundos)."""
    tz = pytz.timezone(get_settings().timezone)
    return datetime.now(tz).replace(tzinfo=None)
