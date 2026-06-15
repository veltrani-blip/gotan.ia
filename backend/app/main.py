"""Ponto de entrada FastAPI da Ana.

Inicializa o app, registra os routers e sobe o event loop (APScheduler) no
ciclo de vida da aplicação. Em desenvolvimento, popula um usuário de exemplo.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from . import __version__
from .config import get_settings
from .routers import conversation, health, users
from .scheduler.event_loop import register_jobs
from .services.ana_agent import SYSTEM_PROMPT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ana")

scheduler = AsyncIOScheduler(timezone=get_settings().timezone)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    # Em dev, sem Firestore, popula dados de exemplo.
    if not settings.is_production and not settings.use_firestore:
        from .seed import seed

        uid = seed()
        logger.info("Seed de desenvolvimento criado: userId=%s", uid)

    register_jobs(scheduler)
    scheduler.start()
    logger.info("Ana online — event loop ativo.")
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)
        logger.info("Ana encerrada.")


app = FastAPI(
    title="Ana — Assistente de Voz e Sentinela de Saúde",
    description="Backend FastAPI: perfis, rotinas, event loop proativo e "
                "integrações (Vertex AI, Twilio, Firestore).",
    version=__version__,
    lifespan=lifespan,
)

app.include_router(users.router)
app.include_router(health.router)
app.include_router(conversation.router)


@app.get("/", tags=["meta"])
def root():
    return {"service": "ana", "version": __version__, "status": "ok"}


@app.get("/healthz", tags=["meta"])
def healthz():
    return {"status": "healthy"}


@app.get("/ana/system-prompt", tags=["meta"])
def system_prompt():
    return {"systemPrompt": SYSTEM_PROMPT}
