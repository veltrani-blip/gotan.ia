"""Camada de conversação da Ana (Vertex AI / Gemini 1.5 Pro).

A lógica de conversa é mantida separada da lógica de negócio (event loop,
repositório). Em desenvolvimento, ``generate_reply`` usa templates locais; em
produção, encaminha para o Vertex AI Agent Engine com *function calling* e o
Live API para streaming de áudio de baixa latência (< 2 s).
"""

from __future__ import annotations

from ..config import get_settings

# System prompt da Ana — define personalidade e prioridades.
SYSTEM_PROMPT = (
    "Você é Ana, uma assistente dedicada, serena e atenciosa para idosos. "
    "Fale de forma clara e com tom calmante. Explique termos técnicos quando "
    "necessário. Seja proativa: se notar silêncio incomum, falta de resposta a "
    "um medicamento ou alteração na rotina, pergunte com cuidado se está tudo "
    "bem. Incentive hidratação, alimentação e contato com familiares. Respeite "
    "o modo 'Não Perturbe' nos horários configurados. Sua prioridade é a "
    "autonomia do idoso e a tranquilidade da família."
)

# Ferramentas expostas ao modelo via function calling (declaração).
FUNCTION_DECLARATIONS = [
    {"name": "confirm_medication", "description": "Registra que o idoso tomou um medicamento."},
    {"name": "log_hydration", "description": "Registra que o idoso bebeu água."},
    {"name": "log_meal", "description": "Registra que o idoso fez uma refeição."},
    {"name": "send_voice_message", "description": "Envia áudio do idoso a um familiar."},
    {"name": "start_cognitive_game", "description": "Inicia um mini-jogo cognitivo."},
    {"name": "trigger_emergency", "description": "Aciona contatos de emergência."},
]


def build_prompt(user_data: dict, user_message: str) -> str:
    """Monta o prompt contextualizado com o perfil do idoso."""
    name = (user_data or {}).get("name", "")
    return f"{SYSTEM_PROMPT}\n\n[Usuário: {name}]\nMensagem: {user_message}"


def generate_reply(user_data: dict, user_message: str) -> str:
    """Gera uma resposta da Ana.

    Em produção (``ANA_USE_VERTEX=true``) encaminha para o Gemini 1.5 Pro; em
    dev usa um eco simples para permitir testes ponta a ponta sem credenciais.
    """
    settings = get_settings()
    if not settings.use_vertex:
        name = (user_data or {}).get("name", "")
        saudacao = f"{name}, " if name else ""
        return f"{saudacao}estou aqui com você. Você disse: “{user_message}”."

    # pragma: no cover - requer credenciais Vertex AI
    from vertexai.generative_models import GenerativeModel
    import vertexai

    vertexai.init(project=settings.gcp_project_id, location=settings.vertex_location)
    model = GenerativeModel(settings.vertex_model, system_instruction=SYSTEM_PROMPT)
    response = model.generate_content(build_prompt(user_data, user_message))
    return response.text
