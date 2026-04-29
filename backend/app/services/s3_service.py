"""S3/MinIO storage for plan images using synchronous boto3."""

import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.core.config import settings

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def is_s3_configured() -> bool:
    return bool(settings.s3_endpoint_url and settings.s3_bucket_name)


def get_s3_client():
    kwargs: dict = {"endpoint_url": settings.s3_endpoint_url}
    if settings.s3_access_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
    if settings.s3_secret_key:
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **kwargs)


def upload_plan_image(file: UploadFile, plan_id: str) -> tuple[str, str]:
    """Upload image to S3. Returns (s3_key, public_url)."""
    ext = Path(file.filename or "image").suffix.lower() or ".bin"
    s3_key = f"plans/{plan_id}/{uuid.uuid4()}{ext}"
    data = file.file.read()
    get_s3_client().put_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
        Body=data,
        ContentType=file.content_type or "application/octet-stream",
    )
    url = f"{settings.s3_endpoint_url}/{settings.s3_bucket_name}/{s3_key}"
    return s3_key, url


def delete_plan_image(s3_key: str) -> None:
    get_s3_client().delete_object(Bucket=settings.s3_bucket_name, Key=s3_key)
