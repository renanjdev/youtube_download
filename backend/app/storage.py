import boto3
from botocore.exceptions import ClientError

from .config import get_settings

settings = get_settings()

_session = boto3.session.Session()
_s3 = _session.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


def upload_to_storage(file_path: str, bucket_key: str) -> str:
    try:
        _s3.upload_file(file_path, settings.STORAGE_BUCKET, bucket_key)
        return _s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.STORAGE_BUCKET, 'Key': bucket_key},
            ExpiresIn=settings.FILE_EXPIRATION_SECONDS,
        )
    except ClientError as error:
        raise RuntimeError(f'Falha ao subir para storage: {error}')
