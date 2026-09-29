"""
DealMind FastAPI Application Entry Point
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import app_config, hindsight_config
from backend.routes.api import router
from backend.services.hindsight_service import ensure_bank_exists

# Configure logging
logging.basicConfig(
    level=getattr(logging, app_config.log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("=" * 60)
    logger.info("🧠 DealMind — Memory-Powered Sales Intelligence Agent")
    logger.info("=" * 60)
    logger.info(f"Hindsight base URL: {hindsight_config.base_url}")
    logger.info(f"Hindsight bank ID:  {hindsight_config.bank_id}")
    logger.info(f"Hindsight API key configured: {bool(hindsight_config.api_key)}")

    if hindsight_config.api_key:
        await ensure_bank_exists()
    else:
        logger.warning("⚠️  HINDSIGHT_API_KEY not set — memory operations will fail.")

    yield

    logger.info("DealMind shutting down.")


app = FastAPI(
    title="DealMind API",
    description="Memory-Powered Sales Deal Intelligence Agent — powered by Hindsight",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api prefix
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "DealMind API",
        "tagline": "An AI sales agent that remembers every deal.",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=app_config.host,
        port=app_config.port,
        reload=True,
        log_level=app_config.log_level.lower(),
    )
