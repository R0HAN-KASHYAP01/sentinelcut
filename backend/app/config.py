from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_SERVICE_KEY: str
    REDIS_URL: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_SERVICE_KEY: str
    REDIS_URL: str
    FFMPEG_PATH: str = "ffmpeg"   # falls back to PATH lookup if not set

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()