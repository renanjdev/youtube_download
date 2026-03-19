# Media SaaS Platform

Arquitetura desacoplada pronta para produção com download de vídeos, extração de áudios e monitoramento em tempo real.

## Visão geral

- **Frontend** (rontend/): Next.js + Tailwind + Framer Motion — interface futurista dark com neon azul e dashboard de jobs.
- **API** (ackend/): FastAPI + SQLAlchemy + Redis/RQ para expor /jobs e /files.
- **Worker** (worker/): processo Python com yt-dlp, FFmpeg e upload para S3/Cloudflare R2.
- **Storage**: S3/R2 com estrutura user_id/job_id/<arquivo>.
- **Banco**: PostgreSQL com tabelas users, jobs, iles.

## Configuração comum

1. Copie .env.example para .env na raiz e preencha as credenciais (PostgreSQL, Redis, S3/R2).
2. Garanta que fmpeg e yt-dlp estejam disponíveis no PATH para o worker.

## Backend (FastAPI)

- ackend/app: modelos SQLAlchemy, dependências, rate limiter Redis e fila RQ.
- Execute uvicorn app.main:app --reload dentro de ackend com .env configurado.
- A API exige X-User-Id em todas as chamadas (pode ser um UUID dinâmico do frontend).

## Frontend (Next.js)

- rontend/ contém o dashboard, formulário e polling de jobs com animações neon.
- Defina NEXT_PUBLIC_API_URL para apontar para a API (http://localhost:8000).
- Scripts disponíveis: 
pm run dev, 
pm run build, 
pm run start.

## Worker (RQ)

- worker/tasks.py expõe process_job que roda yt-dlp, converte com FFmpeg, envia para storage e atualiza o PostgreSQL.
- Rode q worker media --url  dentro de worker/ com o .env carregado.
