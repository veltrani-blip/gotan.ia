# Ana backend — imagem para Google Cloud Run
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Cloud Run injeta a porta via $PORT.
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
