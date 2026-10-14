from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.modules.eligibility.router import router as eligibility_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Anspruch API", version="0.1.0")

    if settings.applicationinsights_connection_string:
        from azure.monitor.opentelemetry import configure_azure_monitor
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        configure_azure_monitor(
            connection_string=settings.applicationinsights_connection_string
        )
        # Explicit, because FastAPI was imported before auto-instrumentation ran.
        FastAPIInstrumentor.instrument_app(app, excluded_urls="healthz")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,  # strict allowlist, never "*"
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    app.include_router(eligibility_router, prefix="/api/v1")

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
