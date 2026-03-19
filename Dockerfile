FROM python:3.11-slim

# Instala ffmpeg e deno para o yt-dlp-ejs resolver os desafios do YouTube.
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ffmpeg unzip && \
    curl -fsSL https://deno.land/install.sh | sh -s -- -q && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala as dependencias do Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do backend
COPY backend/app ./app

# O Render.com injeta a variável $PORT dinamicamente
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
