"""Configuração central da aplicação Ana.

As configurações são lidas de variáveis de ambiente (ver ``.env.example``).
Em desenvolvimento, nenhuma credencial é obrigatória: o backend usa um
repositório Firestore em memória e *stubs* para Twilio / Vertex AI.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="ANA_", extra="ignore"
    )

    # --- Aplicação ---
    environment: str = "development"  # development | production
    timezone: str = "America/Sao_Paulo"

    # --- Google Cloud / Firestore ---
    # Quando vazio, o backend usa o repositório em memória (dev/testes).
    gcp_project_id: str = ""
    use_firestore: bool = False

    # --- Vertex AI (Gemini 1.5 Pro / Agent Builder) ---
    vertex_location: str = "us-central1"
    vertex_model: str = "gemini-1.5-pro"
    use_vertex: bool = False

    # --- Twilio (alertas críticos SMS / chamada) ---
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""
    use_twilio: bool = False

    # --- Event loop (intervalos em minutos) ---
    medication_check_interval_min: int = 1
    hydration_check_interval_min: int = 5
    geofence_check_interval_min: int = 10
    # Janela de antecedência para disparar um lembrete de dose/refeição.
    reminder_lookahead_min: int = 5
    # Tempo após a dose sem confirmação antes de escalar para a família.
    medication_escalation_min: int = 30

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
