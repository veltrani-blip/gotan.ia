"""Estrutura de dados inicial / seed do Firestore.

Cria o usuário de exemplo "Sr. Wellington" com medicamentos, plano de
hidratação, refeições, perímetro seguro e contato de emergência. Pode ser
executado isoladamente (``python -m app.seed``) ou chamado no startup em dev.
"""

from __future__ import annotations

from datetime import datetime

from .repository import (
    SUB_EVENTS,
    SUB_MEDICATIONS,
    get_repository,
)
from .schemas import (
    Contact,
    DoNotDisturb,
    EmergencyContact,
    Event,
    EventType,
    Geofence,
    MealSchedule,
    Medication,
    Settings,
    UserProfile,
)


def seed() -> str:
    repo = get_repository()

    profile = UserProfile(
        name="Sr. Wellington",
        birthDate=datetime(1948, 3, 12),
        contact=Contact(phone="+5522999990000", email="wellington@example.com"),
        emergencyContacts=[
            EmergencyContact(name="Carla (filha)", phone="+5522988887777",
                             relation="filha", notifyByCall=True),
        ],
        hydrationIntervalHours=2,
        mealSchedule=MealSchedule(breakfast="08:00", lunch="12:00", dinner="19:00"),
        geofence=Geofence(lat=-22.5220, lng=-41.9472, radiusMeters=300, enabled=True),
        settings=Settings(
            doNotDisturb=DoNotDisturb(enabled=True, start="22:00", end="07:00",
                                      afternoonStart="13:00", afternoonEnd="15:00"),
            sentinelEnabled=True,
            language="pt-BR",
            volume=80,
        ),
    )
    user_id = repo.create_user(profile.model_dump())

    repo.add_subdoc(user_id, SUB_MEDICATIONS, Medication(
        name="Losartana", dosage="50 mg", schedule=["08:00", "20:00"],
        requiresConfirmation=True, notes="Tomar com água",
    ).model_dump())
    repo.add_subdoc(user_id, SUB_MEDICATIONS, Medication(
        name="Sinvastatina", dosage="20 mg", schedule=["20:00"],
        requiresConfirmation=True, notes="Após o jantar",
    ).model_dump())

    repo.add_subdoc(user_id, SUB_EVENTS, Event(
        type=EventType.bill, description="Conta de luz vence",
        date=datetime(2026, 6, 25, 15, 0), paid=False,
    ).model_dump())

    return user_id


if __name__ == "__main__":  # pragma: no cover
    uid = seed()
    print(f"Seed criado. userId = {uid}")
