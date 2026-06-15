"""Camada de persistência da Ana.

Define uma interface de domínio (``Repository``) com duas implementações:

* ``InMemoryRepository`` — usada em desenvolvimento e nos testes. Não requer
  credenciais; mantém os dados em memória.
* ``FirestoreRepository`` — usa ``google-cloud-firestore`` quando
  ``ANA_USE_FIRESTORE=true`` e credenciais estão disponíveis.

Ambas expõem os mesmos métodos de domínio, de forma que o *event loop* e os
routers são agnósticos ao backend.
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional

from .config import get_settings

# Nomes de subcoleções (mantidos em inglês para consistência técnica).
SUB_MEDICATIONS = "medications"
SUB_EVENTS = "events"
SUB_HEALTH_LOGS = "healthLogs"
SUB_COGNITIVE = "cognitiveSessions"
SUB_LOCATIONS = "locationHistory"
SUB_REMINDERS = "reminders"


def _new_id() -> str:
    return uuid.uuid4().hex[:20]


# --------------------------------------------------------------------------- #
# Interface
# --------------------------------------------------------------------------- #
class Repository(ABC):
    # users -----------------------------------------------------------------
    @abstractmethod
    def create_user(self, data: dict, user_id: Optional[str] = None) -> str: ...

    @abstractmethod
    def get_user(self, user_id: str) -> Optional[dict]: ...

    @abstractmethod
    def list_users(self) -> list[tuple[str, dict]]:
        """Retorna ``[(user_id, data), ...]``."""

    # subcoleções genéricas -------------------------------------------------
    @abstractmethod
    def add_subdoc(
        self, user_id: str, sub: str, data: dict, doc_id: Optional[str] = None
    ) -> str: ...

    @abstractmethod
    def list_subdocs(self, user_id: str, sub: str) -> list[tuple[str, dict]]: ...

    @abstractmethod
    def get_subdoc(self, user_id: str, sub: str, doc_id: str) -> Optional[dict]: ...

    @abstractmethod
    def update_subdoc(self, user_id: str, sub: str, doc_id: str, fields: dict) -> None: ...

    @abstractmethod
    def latest_subdoc(
        self, user_id: str, sub: str, *, where: Optional[tuple[str, Any]] = None
    ) -> Optional[tuple[str, dict]]:
        """Documento mais recente por ``timestamp`` (desc), opcionalmente
        filtrado por ``where=(campo, valor)``."""

    # notifications (coleção global) ---------------------------------------
    @abstractmethod
    def add_notification(self, data: dict) -> str: ...

    @abstractmethod
    def list_notifications(self, user_id: Optional[str] = None) -> list[tuple[str, dict]]: ...


# --------------------------------------------------------------------------- #
# Implementação em memória
# --------------------------------------------------------------------------- #
class InMemoryRepository(Repository):
    def __init__(self) -> None:
        # users[user_id] = {"data": {...}, "subs": {sub: {doc_id: {...}}}}
        self._users: dict[str, dict] = {}
        self._notifications: dict[str, dict] = {}

    # users -----------------------------------------------------------------
    def create_user(self, data, user_id=None):
        user_id = user_id or _new_id()
        self._users[user_id] = {"data": dict(data), "subs": {}}
        return user_id

    def get_user(self, user_id):
        u = self._users.get(user_id)
        return dict(u["data"]) if u else None

    def list_users(self):
        return [(uid, dict(u["data"])) for uid, u in self._users.items()]

    # subcoleções -----------------------------------------------------------
    def _sub(self, user_id: str, sub: str) -> dict:
        return self._users[user_id]["subs"].setdefault(sub, {})

    def add_subdoc(self, user_id, sub, data, doc_id=None):
        doc_id = doc_id or _new_id()
        self._sub(user_id, sub)[doc_id] = dict(data)
        return doc_id

    def list_subdocs(self, user_id, sub):
        if user_id not in self._users:
            return []
        return [(did, dict(d)) for did, d in self._sub(user_id, sub).items()]

    def get_subdoc(self, user_id, sub, doc_id):
        d = self._sub(user_id, sub).get(doc_id)
        return dict(d) if d else None

    def update_subdoc(self, user_id, sub, doc_id, fields):
        col = self._sub(user_id, sub)
        if doc_id in col:
            col[doc_id].update(fields)

    def latest_subdoc(self, user_id, sub, *, where=None):
        docs = self.list_subdocs(user_id, sub)
        if where:
            field, value = where
            docs = [d for d in docs if d[1].get(field) == value]
        if not docs:
            return None
        docs.sort(key=lambda kv: kv[1].get("timestamp") or datetime.min, reverse=True)
        return docs[0]

    # notifications ---------------------------------------------------------
    def add_notification(self, data):
        nid = _new_id()
        self._notifications[nid] = dict(data)
        return nid

    def list_notifications(self, user_id=None):
        items = list(self._notifications.items())
        if user_id:
            items = [(i, d) for i, d in items if d.get("userId") == user_id]
        return [(i, dict(d)) for i, d in items]


# --------------------------------------------------------------------------- #
# Implementação Firestore
# --------------------------------------------------------------------------- #
class FirestoreRepository(Repository):
    def __init__(self, project_id: str) -> None:
        from google.cloud import firestore  # import tardio (dependência opcional)

        self._firestore = firestore
        self._db = firestore.Client(project=project_id or None)

    def create_user(self, data, user_id=None):
        if user_id:
            self._db.collection("users").document(user_id).set(dict(data))
            return user_id
        ref = self._db.collection("users").add(dict(data))[1]
        return ref.id

    def get_user(self, user_id):
        snap = self._db.collection("users").document(user_id).get()
        return snap.to_dict() if snap.exists else None

    def list_users(self):
        return [(s.id, s.to_dict()) for s in self._db.collection("users").stream()]

    def _col(self, user_id, sub):
        return self._db.collection("users").document(user_id).collection(sub)

    def add_subdoc(self, user_id, sub, data, doc_id=None):
        if doc_id:
            self._col(user_id, sub).document(doc_id).set(dict(data))
            return doc_id
        return self._col(user_id, sub).add(dict(data))[1].id

    def list_subdocs(self, user_id, sub):
        return [(s.id, s.to_dict()) for s in self._col(user_id, sub).stream()]

    def get_subdoc(self, user_id, sub, doc_id):
        snap = self._col(user_id, sub).document(doc_id).get()
        return snap.to_dict() if snap.exists else None

    def update_subdoc(self, user_id, sub, doc_id, fields):
        self._col(user_id, sub).document(doc_id).update(dict(fields))

    def latest_subdoc(self, user_id, sub, *, where=None):
        query = self._col(user_id, sub)
        if where:
            query = query.where(where[0], "==", where[1])
        query = query.order_by(
            "timestamp", direction=self._firestore.Query.DESCENDING
        ).limit(1)
        docs = list(query.stream())
        return (docs[0].id, docs[0].to_dict()) if docs else None

    def add_notification(self, data):
        return self._db.collection("notifications").add(dict(data))[1].id

    def list_notifications(self, user_id=None):
        col = self._db.collection("notifications")
        if user_id:
            col = col.where("userId", "==", user_id)
        return [(s.id, s.to_dict()) for s in col.stream()]


# --------------------------------------------------------------------------- #
# Factory (singleton)
# --------------------------------------------------------------------------- #
_repo: Optional[Repository] = None


def get_repository() -> Repository:
    global _repo
    if _repo is not None:
        return _repo
    settings = get_settings()
    if settings.use_firestore:
        _repo = FirestoreRepository(settings.gcp_project_id)
    else:
        _repo = InMemoryRepository()
    return _repo


def set_repository(repo: Repository) -> None:
    """Usado em testes para injetar um repositório limpo."""
    global _repo
    _repo = repo
