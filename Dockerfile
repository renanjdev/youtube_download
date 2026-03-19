FROM python:3.11-slim

# Instala o ffmpeg (Essencial para o yt-dlp fundir audio e video do Youtube)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala as dependencias do Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do backend
COPY backend/app ./app

# O Render.com injeta a variável $PORT dinamicamente
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
