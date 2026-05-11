"""S3/MinIO storage for plan images using synchronous boto3."""

import uuid
from pathlib import Path

import boto3

from app.core.config import settings

_LOCAL_UPLOADS_DIR = Path("/app/uploads")


def is_s3_configured() -> bool:
    return bool(settings.s3_endpoint_url and settings.s3_bucket_name)


def is_local_key(s3_key: str) -> bool:
    return s3_key.startswith("local/")


def _local_path(s3_key: str) -> Path:
    return _LOCAL_UPLOADS_DIR / s3_key[len("local/"):]


def upload_plan_image_local(data: bytes, content_type: str, plan_id: str, ext: str) -> str:
    """Store image bytes on the local filesystem. Returns storage key."""
    key = f"local/plans/{plan_id}/{uuid.uuid4()}{ext}"
    path = _local_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return key


def get_plan_image_local(s3_key: str) -> tuple[bytes, str]:
    """Fetch image bytes from local filesystem."""
    path = _local_path(s3_key)
    ext = path.suffix.lower()
    content_type_map = {".webp": "image/webp", ".svg": "image/svg+xml"}
    return path.read_bytes(), content_type_map.get(ext, "application/octet-stream")


def delete_plan_image_local(s3_key: str) -> None:
    _local_path(s3_key).unlink(missing_ok=True)


def get_s3_client():
    kwargs: dict = {"endpoint_url": settings.s3_endpoint_url}
    if settings.s3_access_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
    if settings.s3_secret_key:
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **kwargs)


def upload_plan_image(data: bytes, content_type: str, plan_id: str, ext: str) -> str:
    """Upload image bytes to S3. Returns s3_key."""
    s3_key = f"plans/{plan_id}/{uuid.uuid4()}{ext}"
    get_s3_client().put_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
        Body=data,
        ContentType=content_type,
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
