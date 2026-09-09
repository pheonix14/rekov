from fastapi import APIRouter, Request
from pydantic import BaseModel
import urllib.request
import json

router = APIRouter()

class CurrencyResponse(BaseModel):
    currency: str
    country: str
    ip: str

@router.get("/currency", response_model=CurrencyResponse)
def get_currency(request: Request):
    client_ip = request.client.host
    # For local development, an IP of 127.0.0.1 won't return useful geolocation.
    # We will use a public IP API to get info if possible.
    try:
        # A simple free IP api that returns currency
        # We'll use a hardcoded IP if localhost for testing
        test_ip = "" if client_ip in ["127.0.0.1", "::1", "localhost"] else client_ip
        url = f"https://ipapi.co/{test_ip}/json/" if test_ip else "https://ipapi.co/json/"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            return CurrencyResponse(
                currency=data.get("currency", "USD"),
                country=data.get("country_name", "Unknown"),
                ip=data.get("ip", client_ip)
            )
    except Exception as e:
        # Fallback in case of offline/errors
        return CurrencyResponse(
            currency="USD",
            country="Fallback",
            ip=client_ip
        )
