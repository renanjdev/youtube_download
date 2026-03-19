# Worker

## Setup

1. Configure a Python environment and instale as dependências:
   `ash
   pip install -r requirements.txt
   `
2. Certifique-se de ter fmpeg instalado e disponível no PATH e copie o arquivo .env com credenciais do backend (PostgreSQL, Redis e storage).

## Execução

- Inicie um worker da fila RQ:
  `ash
  rq worker media --url redis://localhost:6379/0
  `
- Os jobs chamam worker.tasks.process_job que usa yt-dlp, converte com FFmpeg, envia para o storage e atualiza o PostgreSQL.
