"""
DealMind Backend Configuration
Loads environment variables and provides config objects.
"""
import os
from dotenv import load_dotenv

load_dotenv()


def is_valid_key(key: str) -> bool:
    """Check if an API key is set and not a placeholder."""
    if not key or not key.strip():
        return False
    k = key.strip().lower()
    if k.startswith("your_") or "placeholder" in k or k == "xxx" or k == "change_me":
        return False
    return True


class HindsightConfig:
    base_url: str = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    api_key: str = os.getenv("HINDSIGHT_API_KEY", "")
    bank_id: str = os.getenv("HINDSIGHT_BANK_ID", "dealmind-sales-memory")

    def is_valid(self) -> bool:
        return is_valid_key(self.api_key)


class GroqConfig:
    api_key: str = os.getenv("GROQ_API_KEY", "")
    model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))

    def is_valid(self) -> bool:
        return is_valid_key(self.api_key)


class AppConfig:
    host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    port: int = int(os.getenv("BACKEND_PORT", "8000"))
    cors_origins: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


hindsight_config = HindsightConfig()
groq_config = GroqConfig()
app_config = AppConfig()
