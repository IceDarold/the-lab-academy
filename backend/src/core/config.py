from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Test environment settings (must be before DATABASE_URL for validator)
    TESTING: bool = False

    # Critical environment variables - required for app startup
    SECRET_KEY: str
    DATABASE_URL: Optional[str] = None
    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v):
        if not v:
            raise ValueError('SECRET_KEY is required')
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        # Check for complexity: at least one uppercase, one lowercase, one digit, one special char
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(not c.isalnum() for c in v)
        if not (has_upper and has_lower and has_digit and has_special):
            raise ValueError('SECRET_KEY must contain at least one uppercase letter, one lowercase letter, one digit, and one special character')
        return v


    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v, info):
        if not info.data.get('TESTING') and not v:
            raise ValueError('DATABASE_URL is required when not in testing mode')
        return v

    # Test environment settings
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    # Optional Supabase settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Default settings
    ALGORITHM: str = "HS256"
    CONTENT_ROOT: str = "content"
    EMAIL_CHECK_DELIVERABILITY: bool = True
    DEBUG: bool = False


settings = Settings()