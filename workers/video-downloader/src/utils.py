"""
Utility functions for video downloader
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


def generate_s3_key(user_id: str, project_id: Optional[str], filename: str, category: str = "source") -> str:
    """
    Generate S3 key following storage convention
    
    Convention: users/{userId}/projects/{projectId}/{category}/{filename}
    """
    if project_id:
        return f"users/{user_id}/projects/{project_id}/{category}/{filename}"
    else:
        return f"users/{user_id}/temp/{category}/{filename}"

