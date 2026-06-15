from datetime import datetime, timedelta

from app.repository import (
    SUB_HEALTH_LOGS,
    SUB_LOCATIONS,
    SUB_MEDICATIONS,
    SUB_REMINDERS,
)
from app.scheduler import event_loop as el
from app.schemas import HealthCategory, MedicationStatus


def _make_user(repo, **overrides):
    data = {
        "name": "Sr. Wellington",
        "hydrationIntervalHours": 2,
        "mealSchedule": {},
        "geofence": {"enabled": False},
        "settings": {"doNotDisturb": {"enabled": False}},
        "emergencyContacts": [{"name": "Carla", "phone": "+550000", "notifyByCall": False}],
    }
    data.update(overrides)
    return repo.create_user(data)


def test_medication_fires_in_window(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    repo.add_subdoc(uid, SUB_MEDICATIONS, {
        "name": "Losartana", "dosage": "50 mg", "schedule": ["08:00"],
        "requiresConfirmation": True,
    })
    now = datetime(2026, 6, 15, 8, 0)
    assert el.check_medications(now=now) == 1
    # Reminder pendente criado.
    reminders = repo.list_subdocs(uid, SUB_REMINDERS)
    assert len(reminders) == 1
    assert reminders[0][1]["status"] == MedicationStatus.pending.value


def test_medication_not_fired_twice(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    repo.add_subdoc(uid, SUB_MEDICATIONS, {
        "name": "Losartana", "dosage": "50 mg", "schedule": ["08:00"],
        "requiresConfirmation": True,
    })
    now = datetime(2026, 6, 15, 8, 0)
    assert el.check_medications(now=now) == 1
    assert el.check_medications(now=now) == 0  # idempotente para a mesma dose


def test_medication_outside_window(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    repo.add_subdoc(uid, SUB_MEDICATIONS, {
        "name": "Losartana", "dosage": "50 mg", "schedule": ["08:00"],
    })
    now = datetime(2026, 6, 15, 10, 0)  # fora da janela
    assert el.check_medications(now=now) == 0


def test_medication_escalation(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    med_id = repo.add_subdoc(uid, SUB_MEDICATIONS, {
        "name": "Losartana", "dosage": "50 mg", "schedule": ["08:00"],
        "requiresConfirmation": True,
    })
    repo.add_subdoc(uid, SUB_REMINDERS, {
        "medicationId": med_id, "doseTime": "08:00",
        "scheduledAt": datetime(2026, 6, 15, 8, 0),
        "status": MedicationStatus.pending.value,
        "requiresConfirmation": True,
    })
    # 40 min depois, sem confirmação → escala.
    now = datetime(2026, 6, 15, 8, 40)
    assert el.check_medication_escalations(now=now) == 1
    rem = repo.list_subdocs(uid, SUB_REMINDERS)[0][1]
    assert rem["status"] == MedicationStatus.missed.value
    # Notificações de emergência registradas.
    assert len(repo.list_notifications(uid)) >= 1


def test_hydration_reminder_when_no_logs(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    now = datetime(2026, 6, 15, 10, 0)
    assert el.check_hydration_and_meals(now=now) == 1


def test_hydration_not_due_recent_log(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo)
    repo.add_subdoc(uid, SUB_HEALTH_LOGS, {
        "timestamp": datetime(2026, 6, 15, 9, 30),
        "category": HealthCategory.hydration.value,
        "details": {"drank": True},
    })
    now = datetime(2026, 6, 15, 10, 0)  # só 30 min depois (intervalo 2h)
    assert el.check_hydration_and_meals(now=now) == 0


def test_meal_reminder(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo, mealSchedule={"lunch": "12:00"})
    # Garante que hidratação não dispare (log recente).
    repo.add_subdoc(uid, SUB_HEALTH_LOGS, {
        "timestamp": datetime(2026, 6, 15, 11, 50),
        "category": HealthCategory.hydration.value, "details": {},
    })
    now = datetime(2026, 6, 15, 12, 0)
    assert el.check_hydration_and_meals(now=now) == 1


def test_geofence_breach(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo, geofence={
        "lat": -22.5220, "lng": -41.9472, "radiusMeters": 100, "enabled": True,
    })
    repo.add_subdoc(uid, SUB_LOCATIONS, {
        "timestamp": datetime(2026, 6, 15, 10, 0),
        "coordinates": {"lat": -22.5300, "lng": -41.9500},  # fora
        "status": "outside",
    })
    now = datetime(2026, 6, 15, 10, 5)
    assert el.check_geofence(now=now) == 1
    assert len(repo.list_notifications(uid)) >= 1


def test_geofence_alert_not_repeated(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo, geofence={
        "lat": -22.5220, "lng": -41.9472, "radiusMeters": 100, "enabled": True,
    })
    repo.add_subdoc(uid, SUB_LOCATIONS, {
        "timestamp": datetime(2026, 6, 15, 10, 0),
        "coordinates": {"lat": -22.5300, "lng": -41.9500},  # fora
        "status": "outside",
    })
    now = datetime(2026, 6, 15, 10, 5)
    assert el.check_geofence(now=now) == 1
    # Mesma amostra estagnada → não alerta de novo nas próximas execuções.
    assert el.check_geofence(now=datetime(2026, 6, 15, 10, 15)) == 0
    notifs_after_first = len(repo.list_notifications(uid))
    assert el.check_geofence(now=datetime(2026, 6, 15, 10, 25)) == 0
    assert len(repo.list_notifications(uid)) == notifs_after_first


def test_geofence_inside_no_alert(fresh_repo):
    repo = fresh_repo
    uid = _make_user(repo, geofence={
        "lat": -22.5220, "lng": -41.9472, "radiusMeters": 300, "enabled": True,
    })
    repo.add_subdoc(uid, SUB_LOCATIONS, {
        "timestamp": datetime(2026, 6, 15, 10, 0),
        "coordinates": {"lat": -22.5221, "lng": -41.9473},  # dentro
        "status": "inside",
    })
    now = datetime(2026, 6, 15, 10, 5)
    assert el.check_geofence(now=now) == 0
