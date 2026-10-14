from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "dev"
    # Strict allowlist. NEVER "*" together with credentials.
    cors_allow_origins: list[str] = ["http://localhost:5173"]
    # Set in Azure only. Telemetry carries routes, status codes and timings,
    # never request bodies, so no SENSITIVE field reaches Application Insights.
    applicationinsights_connection_string: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
