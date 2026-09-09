import os

class Settings:
    PROJECT_NAME: str = "rekov API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://rekov.onrender.com",
        "*"
    ]

settings = Settings()
