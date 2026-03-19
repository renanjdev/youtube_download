import os
from supabase import create_client, Client
from .config import get_settings

settings = get_settings()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def upload_to_storage(file_path: str, bucket_key: str) -> str:
    try:
        with open(file_path, 'rb') as f:
            supabase.storage.from_(settings.STORAGE_BUCKET).upload(
                path=bucket_key,
                file=f,
                file_options={"content-type": "application/octet-stream"}
            )
        
        # Obter URL assinada
        res = supabase.storage.from_(settings.STORAGE_BUCKET).create_signed_url(
            bucket_key, 
            settings.FILE_EXPIRATION_SECONDS
        )
        
        # O supabase-py as vezes retorna um dict com key signedURL, ou a propria string dependendo da versao
        return res.get("signedURL") if isinstance(res, dict) else res

    except Exception as error:
        raise RuntimeError(f'Falha ao subir para o Supabase Storage: {error}')
