"""Rotas de cadastro: usuários, medicamentos e eventos."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..repository import (
    SUB_EVENTS,
    SUB_MEDICATIONS,
    get_repository,
)
from ..schemas import Event, Medication, UserProfile

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", status_code=201)
def create_user(profile: UserProfile):
    repo = get_repository()
    user_id = repo.create_user(profile.model_dump())
    return {"userId": user_id}


@router.get("")
def list_users():
    repo = get_repository()
    return [{"userId": uid, **data} for uid, data in repo.list_users()]


@router.get("/{user_id}")
def get_user(user_id: str):
    repo = get_repository()
    data = repo.get_user(user_id)
    if data is None:
        raise HTTPException(404, "Usuário não encontrado")
    return {"userId": user_id, **data}


@router.post("/{user_id}/medications", status_code=201)
def add_medication(user_id: str, med: Medication):
    repo = get_repository()
    if repo.get_user(user_id) is None:
        raise HTTPException(404, "Usuário não encontrado")
    med_id = repo.add_subdoc(user_id, SUB_MEDICATIONS, med.model_dump())
    return {"medicationId": med_id}


@router.get("/{user_id}/medications")
def list_medications(user_id: str):
    repo = get_repository()
    return [{"medicationId": i, **d}
            for i, d in repo.list_subdocs(user_id, SUB_MEDICATIONS)]


@router.post("/{user_id}/events", status_code=201)
def add_event(user_id: str, event: Event):
    repo = get_repository()
    if repo.get_user(user_id) is None:
        raise HTTPException(404, "Usuário não encontrado")
    event_id = repo.add_subdoc(user_id, SUB_EVENTS, event.model_dump())
    return {"eventId": event_id}


@router.get("/{user_id}/notifications")
def list_notifications(user_id: str):
    repo = get_repository()
    return [{"id": i, **d} for i, d in repo.list_notifications(user_id)]
