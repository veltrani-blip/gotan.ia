from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _create_user():
    resp = client.post("/users", json={
        "name": "Dona Maria",
        "emergencyContacts": [{"name": "João", "phone": "+5511999998888"}],
    })
    assert resp.status_code == 201
    return resp.json()["userId"]


def test_root_and_health():
    assert client.get("/").json()["service"] == "ana"
    assert client.get("/healthz").json()["status"] == "healthy"


def test_system_prompt_exposed():
    body = client.get("/ana/system-prompt").json()
    assert "Ana" in body["systemPrompt"]


def test_user_crud_and_medication():
    uid = _create_user()
    med = client.post(f"/users/{uid}/medications", json={
        "name": "Losartana", "dosage": "50 mg", "schedule": ["08:00"],
    })
    assert med.status_code == 201
    med_id = med.json()["medicationId"]

    confirm = client.post(f"/users/{uid}/medications/confirm",
                          json={"medicationId": med_id})
    assert confirm.json()["status"] == "confirmed"


def test_conversation():
    uid = _create_user()
    resp = client.post(f"/users/{uid}/conversation", json={"text": "bom dia"})
    assert resp.status_code == 200
    assert "reply" in resp.json()


def test_sentinel_triggers_alert():
    uid = _create_user()
    resp = client.post(f"/users/{uid}/sentinel",
                       json={"soundType": "fall", "confidence": 0.9})
    assert resp.json()["status"] == "alerted"
    notifs = client.get(f"/users/{uid}/notifications").json()
    assert any(n["critical"] for n in notifs)
