"""Rotas de saúde e telemetria: confirmação de dose, hidratação, refeição,
localização (geofencing), sentinela e treino cognitivo."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..clock import local_now
from ..repository import (
    SUB_HEALTH_LOGS,
    SUB_LOCATIONS,
    SUB_MEDICATIONS,
    SUB_REMINDERS,
    get_repository,
)
from ..schemas import (
    CognitiveSession,
    HealthCategory,
    HydrationLog,
    LocationUpdate,
    MedicationConfirm,
    MedicationStatus,
    SentinelEvent,
)
from ..services import proactive
from ..services.geofence import inside_geofence

router = APIRouter(prefix="/users/{user_id}", tags=["health"])


def _require_user(user_id: str) -> dict:
    repo = get_repository()
    data = repo.get_user(user_id)
    if data is None:
        raise HTTPException(404, "Usuário não encontrado")
    return data


@router.post("/medications/confirm")
def confirm_medication(user_id: str, payload: MedicationConfirm):
    """Idoso confirma que tomou o remédio (via voz → function calling)."""
    _require_user(user_id)
    repo = get_repository()
    taken_at = payload.takenAt or local_now()

    repo.update_subdoc(user_id, SUB_MEDICATIONS, payload.medicationId,
                       {"lastTaken": taken_at})
    # Marca o reminder pendente do dia como confirmado.
    for rem_id, rem in repo.list_subdocs(user_id, SUB_REMINDERS):
        if (rem.get("medicationId") == payload.medicationId
                and rem.get("status") == MedicationStatus.pending.value):
            repo.update_subdoc(user_id, SUB_REMINDERS, rem_id,
                               {"status": MedicationStatus.taken.value})
    repo.add_subdoc(user_id, SUB_HEALTH_LOGS, {
        "timestamp": taken_at,
        "category": HealthCategory.medication.value,
        "details": {"medicationId": payload.medicationId,
                    "status": MedicationStatus.taken.value},
    })
    return {"status": "confirmed"}


@router.post("/hydration")
def log_hydration(user_id: str, payload: HydrationLog):
    _require_user(user_id)
    repo = get_repository()
    repo.add_subdoc(user_id, SUB_HEALTH_LOGS, {
        "timestamp": local_now(),
        "category": HealthCategory.hydration.value,
        "details": {"drank": payload.drank},
    })
    return {"status": "logged"}


@router.post("/location")
def update_location(user_id: str, payload: LocationUpdate):
    user = _require_user(user_id)
    repo = get_repository()
    now = local_now()
    coords = {"lat": payload.lat, "lng": payload.lng}
    geofence = user.get("geofence") or {}
    status = "inside"
    if geofence.get("enabled", False):
        status = "inside" if inside_geofence(coords, geofence) else "outside"

    # Alerta só na transição inside→outside; amostras "outside" subsequentes
    # do mesmo episódio são marcadas como já alertadas para não duplicar.
    prev = repo.latest_subdoc(user_id, SUB_LOCATIONS)
    prev_status = prev[1].get("status") if prev else "inside"
    is_outside = status == "outside"
    should_alert = is_outside and prev_status != "outside"

    repo.add_subdoc(user_id, SUB_LOCATIONS, {
        "timestamp": now, "coordinates": coords, "status": status,
        "alerted": is_outside,
    })
    if should_alert:
        proactive.notify_family_geofence_breach(user_id, user, coords, now)
    return {"status": status}


@router.post("/sentinel")
def sentinel_event(user_id: str, payload: SentinelEvent):
    """Dispositivo detectou som de queda / pedido de ajuda."""
    user = _require_user(user_id)
    if not (user.get("settings") or {}).get("sentinelEnabled", True):
        return {"status": "ignored", "reason": "sentinel disabled"}
    proactive.handle_sentinel_event(user_id, user, payload.soundType,
                                    local_now())
    return {"status": "alerted"}


@router.post("/cognitive")
def log_cognitive(user_id: str, session: CognitiveSession):
    _require_user(user_id)
    repo = get_repository()
    repo.add_subdoc(user_id, "cognitiveSessions", session.model_dump())
    return {"status": "logged"}
