import os
from functools import lru_cache
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    app_name: str = Field(default="Car Dealership Inventory System API")
    app_env: str = Field(default="development")
    app_debug: bool = Field(default=True)
    app_host: str = Field(default="0.0.0.0")
    app_port: int = Field(default=8000)
    database_url: str = Field(default="sqlite+pysqlite:///./car_dealership.db")
    jwt_secret_key: str = Field(default="change-me")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

@lru_cache
def get_settings() -> Settings:
    cors_value = os.getenv("CORS_ORIGINS")
    parsed_origins = (
        [origin.strip() for origin in cors_value.split(",") if origin.strip()]
        if cors_value
        else ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    return Settings(
        app_name=os.getenv("APP_NAME", "Car Dealership Inventory System API"),
        app_env=os.getenv("APP_ENV", "development"),
        app_debug=os.getenv("APP_DEBUG", "true").lower() == "true",
        app_host=os.getenv("APP_HOST", "0.0.0.0"),
        app_port=int(os.getenv("APP_PORT", "8000")),
        database_url=os.getenv("DATABASE_URL", "sqlite+pysqlite:///./car_dealership.db"),
        jwt_secret_key=os.getenv("JWT_SECRET_KEY", "change-me"),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        ),
        cors_origins=parsed_origins,
    )
