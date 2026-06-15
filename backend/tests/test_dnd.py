from datetime import datetime

from app.services.dnd import in_do_not_disturb, should_deliver

SETTINGS = {
    "doNotDisturb": {
        "enabled": True,
        "start": "22:00",
        "end": "07:00",
        "afternoonStart": "13:00",
        "afternoonEnd": "15:00",
    }
}


def test_night_window_crosses_midnight():
    assert in_do_not_disturb(SETTINGS, datetime(2026, 6, 15, 23, 30)) is True
    assert in_do_not_disturb(SETTINGS, datetime(2026, 6, 15, 6, 0)) is True


def test_afternoon_window():
    assert in_do_not_disturb(SETTINGS, datetime(2026, 6, 15, 14, 0)) is True


def test_active_hours():
    assert in_do_not_disturb(SETTINGS, datetime(2026, 6, 15, 10, 0)) is False


def test_critical_always_delivers():
    night = datetime(2026, 6, 15, 23, 30)
    assert should_deliver(SETTINGS, night, critical=True) is True
    assert should_deliver(SETTINGS, night, critical=False) is False


def test_dnd_disabled():
    s = {"doNotDisturb": {"enabled": False, "start": "22:00", "end": "07:00"}}
    assert in_do_not_disturb(s, datetime(2026, 6, 15, 23, 30)) is False
