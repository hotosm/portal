"""S3/MinIO storage for plan images using synchronous boto3."""

import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.core.config import settings


def is_s3_configured() -> bool:
    return bool(settings.s3_endpoint_url and settings.s3_bucket_name)


def get_s3_client():
    kwargs: dict = {"endpoint_url": settings.s3_endpoint_url}
    if settings.s3_access_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
    if settings.s3_secret_key:
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **kwargs)


def upload_plan_image(file: UploadFile, plan_id: str) -> str:
    """Upload image to S3. Returns s3_key."""
    ext = Path(file.filename or "image").suffix.lower() or ".bin"
    s3_key = f"plans/{plan_id}/{uuid.uuid4()}{ext}"
    data = file.file.read()
    get_s3_client().put_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
        Body=data,
        ContentType=file.content_type or "application/octet-stream",
    )
    return s3_key


def get_plan_image(s3_key: str) -> tuple[bytes, str]:
    """Fetch image bytes and content-type from S3."""
    response = get_s3_client().get_object(Bucket=settings.s3_bucket_name, Key=s3_key)
    data = response["Body"].read()
    content_type = response.get("ContentType", "application/octet-stream")
    return data, content_type


def delete_plan_image(s3_key: str) -> None:
    get_s3_client().delete_object(Bucket=settings.s3_bucket_name, Key=s3_key)
