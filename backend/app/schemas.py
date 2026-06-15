"""Modelos Pydantic — espelham a estrutura de dados do Firestore.

Coleção raiz: ``users/{userId}`` com subcoleções ``medications``,
``events``, ``healthLogs``, ``cognitiveSessions``, ``locationHistory`` e
``reminders``. Coleções globais: ``caregivers`` e ``notifications``.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #
class HealthCategory(str, Enum):
    medication = "medication"
    hydration = "hydration"
    meal = "meal"
    sentinel = "sentinel"
    geofence = "geofence"
    cognitive = "cognitive"


class MedicationStatus(str, Enum):
    taken = "taken"
    missed = "missed"
    late = "late"
    pending = "pending"


class EventType(str, Enum):
    bill = "bill"
    social = "social"
    appointment = "appointment"


class NotificationChannel(str, Enum):
    sms = "sms"
    call = "call"
    push = "push"
    voice = "voice"  # falado pela própria Ana no dispositivo


class NotificationStatus(str, Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


# --------------------------------------------------------------------------- #
# Sub-objetos do documento de usuário
# --------------------------------------------------------------------------- #
class Contact(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None


class EmergencyContact(BaseModel):
    name: str
    phone: str
    relation: Optional[str] = None
    notifyByCall: bool = True


class MealSchedule(BaseModel):
    breakfast: Optional[str] = None  # "HH:MM"
    lunch: Optional[str] = None
    dinner: Optional[str] = None


class Geofence(BaseModel):
    lat: float = 0.0
    lng: float = 0.0
    radiusMeters: float = 200.0
    enabled: bool = False


class DoNotDisturb(BaseModel):
    enabled: bool = True
    start: str = "22:00"  # "HH:MM" — início do descanso noturno
    end: str = "07:00"
    # Janela opcional de descanso da tarde (soneca).
    afternoonStart: Optional[str] = "13:00"
    afternoonEnd: Optional[str] = "15:00"


class Settings(BaseModel):
    doNotDisturb: DoNotDisturb = Field(default_factory=DoNotDisturb)
    sentinelEnabled: bool = True
    language: str = "pt-BR"
    volume: int = 80


# --------------------------------------------------------------------------- #
# Documentos
# --------------------------------------------------------------------------- #
class UserProfile(BaseModel):
    name: str
    birthDate: Optional[datetime] = None
    contact: Contact = Field(default_factory=Contact)
    emergencyContacts: list[EmergencyContact] = Field(default_factory=list)
    hydrationIntervalHours: float = 2.0
    mealSchedule: MealSchedule = Field(default_factory=MealSchedule)
    geofence: Geofence = Field(default_factory=Geofence)
    settings: Settings = Field(default_factory=Settings)


class Medication(BaseModel):
    name: str
    dosage: str
    schedule: list[str] = Field(default_factory=list)  # ["08:00", "20:00"]
    requiresConfirmation: bool = True
    lastTaken: Optional[datetime] = None
    notes: Optional[str] = None


class Event(BaseModel):
    type: EventType
    description: str
    date: datetime
    paid: Optional[bool] = None


class HealthLog(BaseModel):
    timestamp: datetime
    category: HealthCategory
    details: dict = Field(default_factory=dict)


class CognitiveSession(BaseModel):
    timestamp: datetime
    gameType: str  # ex: "wordRecall"
    score: int
    durationMinutes: int


class Coordinates(BaseModel):
    lat: float
    lng: float


class LocationLog(BaseModel):
    timestamp: datetime
    coordinates: Coordinates
    status: str  # "inside" | "outside"


class Notification(BaseModel):
    userId: str
    channel: NotificationChannel
    to: Optional[str] = None
    body: str
    status: NotificationStatus = NotificationStatus.pending
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    critical: bool = False


# --------------------------------------------------------------------------- #
# Payloads de API
# --------------------------------------------------------------------------- #
class MedicationConfirm(BaseModel):
    medicationId: str
    takenAt: Optional[datetime] = None


class HydrationLog(BaseModel):
    drank: bool = True


class LocationUpdate(BaseModel):
    lat: float
    lng: float


class SentinelEvent(BaseModel):
    soundType: str  # "fall", "help", "scream"...
    confidence: float = 1.0
