import logging
import os
import sys
import tempfile
from pathlib import Path
from uuid import UUID

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR / 'backend'))

from backend.app.config import get_settings
from backend.app.crud import create_file, get_job, update_job_status
from backend.app.database import SessionLocal
from backend.app.storage import upload_to_storage
from yt_dlp import YoutubeDL

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

settings = get_settings()


def sanitize_filename(name: str) -> str:
    keep = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
    cleaned = ''.join(ch if ch in keep else '_' for ch in name)
    return cleaned.strip('_') or 'file'


def build_options(job_url: str, output_dir: str, mode: str) -> dict:
    base = {
        'outtmpl': os.path.join(output_dir, f'%(id)s.%(ext)s'),
        'format': 'bestaudio/best',
    }
    if mode == 'video':
        base.update({
            'format': 'bv*+ba/best',
            'merge_output_format': 'mp4',
        })
    else:
        base.update({
            'format': 'bestaudio/best',
            'postprocessors': [
                {
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }
            ],
        })
    base['restrictfilenames'] = True
    base['noplaylist'] = False
    base['ignoreerrors'] = True
    return base


def process_job(job_id: str):
    session = SessionLocal()
    job = None
    try:
        job_uuid = UUID(job_id)
        job = get_job(session, job_uuid)
        if not job:
            logging.error('Job %s não encontrado', job_id)
            return
        update_job_status(session, job.id, 'processing')

        with tempfile.TemporaryDirectory() as tmpdir:
            ydl_opts = build_options(job.url, tmpdir, job.mode)
            with YoutubeDL(ydl_opts) as ydl:
                logging.info('Iniciando download: %s', job.url)
                ydl.download([job.url])

            candidates = sorted(Path(tmpdir).rglob('*'))
            uploaded = 0
            for item in candidates:
                if not item.is_file():
                    continue
                if item.suffix == '.part':
                    continue
                if uploaded >= settings.MAX_FILES_PER_JOB:
                    break
                key = f"{job.user_id}/{job.id}/{sanitize_filename(item.name)}"
                file_url = upload_to_storage(str(item), key)
                create_file(session, job.id, file_url, job.mode)
                uploaded += 1
                logging.info('Arquivo enviado: %s (%s)', key, file_url)

        update_job_status(session, job.id, 'done')
    except Exception as exc:
        logging.exception('Erro ao processar job %s: %s', job_id, exc)
        target_id = getattr(job, 'id', None)
        try:
            update_job_status(session, target_id or UUID(job_id), 'error')
        except Exception as update_exc:
            logging.warning('Não foi possível atualizar status de erro: %s', update_exc)
    finally:
        session.close()
