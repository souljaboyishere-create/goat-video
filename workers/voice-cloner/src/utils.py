"""
Utility functions for voice cloner
"""

import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional


def get_s3_client():
    """Get S3 client"""
    return boto3.client(
        "s3",
        endpoint_url=os.getenv("S3_ENDPOINT"),
        aws_access_key_id=os.getenv("S3_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
        region_name=os.getenv("S3_REGION", "us-east-1"),
    )


def download_from_s3(s3_path: str, local_path: str):
    """
    Download file from S3
    
    Args:
        s3_path: S3 path (s3://bucket/key)
        local_path: Local file path to save to
    
    Raises:
        ValueError if S3 path is invalid
        Exception if download fails
    """
    if not s3_path.startswith("s3://"):
        raise ValueError(f"Invalid S3 path: {s3_path}")

    path_parts = s3_path[5:].split("/", 1)
    bucket = path_parts[0]
    key = path_parts[1] if len(path_parts) > 1 else ""

    try:
        s3_client = get_s3_client()
        s3_client.download_file(bucket, key, local_path)
    except ClientError as e:
        raise Exception(f"Failed to download from S3: {e}")


def upload_to_s3(file_path: str, s3_key: str, bucket: str) -> str:
    """
    Upload file to S3 and return S3 path
    
    Args:
        file_path: Local file path
        s3_key: S3 key (path)
        bucket: S3 bucket name
    
    Returns:
        S3 path (s3://bucket/key)
    
    Raises:
        Exception if upload fails
    """
    try:
        s3_client = get_s3_client()
        s3_client.upload_file(file_path, bucket, s3_key)
        return f"s3://{bucket}/{s3_key}"
    except ClientError as e:
        raise Exception(f"Failed to upload to S3: {e}")


def generate_s3_key(
    user_id: str,
    project_id: Optional[str],
    filename: str,
    category: str = "audio",
) -> str:
    """
    Generate S3 key following storage convention
    
    Convention: users/{userId}/projects/{projectId}/{category}/{filename}
    """
    if project_id:
        return f"users/{user_id}/projects/{project_id}/{category}/{filename}"
    else:
        return f"users/{user_id}/temp/{category}/{filename}"

