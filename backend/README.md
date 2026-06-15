# Ana — Backend (FastAPI + Firestore + Vertex AI)

Backend da **Ana**, assistente de voz e *sentinela de saúde* para idosos.
Arquitetura: **FastAPI** no **Google Cloud Run**, **Firestore** para dados,
**Vertex AI / Gemini 1.5 Pro** (voz + *function calling* + Live API para
streaming < 2 s) e **Twilio** para alertas críticos.

> Em desenvolvimento **nada externo é obrigatório**: o backend usa um
> repositório Firestore em memória e *stubs* para Twilio/Vertex, então roda e
> passa nos testes sem credenciais.

## Estrutura

```
backend/
├── app/
│   ├── main.py             # FastAPI + ciclo de vida do event loop
│   ├── config.py           # settings via env (prefixo ANA_)
│   ├── schemas.py          # modelos Pydantic = estrutura do Firestore
│   ├── repository.py       # InMemory + Firestore (mesma interface)
│   ├── seed.py             # dados iniciais (Sr. Wellington)
│   ├── scheduler/
│   │   └── event_loop.py   # checks: medicação, hidratação, refeição, geofence
│   ├── services/
│   │   ├── proactive.py    # ações proativas + escalonamento
│   │   ├── notifications.py# voz / SMS / chamada (Twilio)
│   │   ├── dnd.py          # "Não Perturbe" inteligente
│   │   ├── geofence.py     # Haversine / perímetro seguro
│   │   └── ana_agent.py    # system prompt + Vertex AI
│   └── routers/            # users, health, conversation
└── tests/                  # pytest (event loop, DND, geofence, API)
```

## Modelo de dados (Firestore)

```
users/{userId}                      # perfil, contatos, geofence, settings (DND)
  ├─ medications/{id}               # nome, dosagem, schedule[], requiresConfirmation
  ├─ events/{id}                    # bill | social | appointment
  ├─ healthLogs/{id}                # medication | hydration | meal | sentinel | geofence
  ├─ cognitiveSessions/{id}         # gameType, score, durationMinutes
  ├─ locationHistory/{id}           # coordinates, status (inside|outside)
  └─ reminders/{id}                 # rastreio de confirmação de dose
notifications/{id}                  # fila/auditoria (sent|pending|failed)
caregivers/{id}                     # familiares e permissões (dashboard)
```

## Rodar localmente

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload      # http://localhost:8000/docs
```

No startup (dev) um usuário de exemplo (**Sr. Wellington**) é criado
automaticamente e o event loop começa a rodar.

## Testes

```bash
cd backend
pytest
```

## Event loop proativo

| Job | Intervalo | Função |
|---|---|---|
| `check_medications` | 1 min | dispara doses na janela e cria `reminder` pendente |
| `check_medication_escalations` | 1 min | doses não confirmadas → alerta família |
| `check_hydration_and_meals` | 5 min | "já bebeu água?" + horários de refeição |
| `check_geofence` | 10 min | saída do perímetro seguro → alerta crítico |

Lembretes rotineiros respeitam o **Não Perturbe** (sono/soneca); medicação,
sentinela e geofencing são **críticos** e sempre passam.

## Deploy no Cloud Run

```bash
gcloud run deploy ana-backend \
  --source backend \
  --region us-central1 \
  --set-env-vars ANA_ENVIRONMENT=production,ANA_USE_FIRESTORE=true,\
ANA_USE_VERTEX=true,ANA_USE_TWILIO=true,ANA_GCP_PROJECT_ID=SEU_PROJETO
```

> **Nota sobre o scheduler no Cloud Run:** com múltiplas instâncias, prefira
> **Cloud Scheduler** chamando endpoints internos (ou uma instância dedicada
> `min-instances=1`) para evitar lembretes duplicados. O `AsyncIOScheduler`
> embarcado atende um único processo (MVP / instância única).

## Integrações (produção)

- **Firestore** — `ANA_USE_FIRESTORE=true` + credenciais ADC.
- **Vertex AI** — `ANA_USE_VERTEX=true`; `ana_agent.generate_reply` usa o
  Gemini 1.5 Pro. Streaming de áudio bidirecional via **Live API**.
- **Twilio** — `ANA_USE_TWILIO=true`; SMS/chamada para contatos de emergência.
- **Nest (câmeras)** — ponto de extensão em `services/` (Smart Device Mgmt API).
