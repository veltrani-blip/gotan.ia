"""Rota de conversação com a Ana (texto; áudio via Live API em produção)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..repository import get_repository
from ..services.ana_agent import generate_reply

router = APIRouter(prefix="/users/{user_id}/conversation", tags=["conversation"])


class Message(BaseModel):
    text: str


@router.post("")
def talk(user_id: str, message: Message):
    repo = get_repository()
    user = repo.get_user(user_id)
    if user is None:
        raise HTTPException(404, "Usuário não encontrado")
    reply = generate_reply(user, message.text)
    return {"reply": reply}
