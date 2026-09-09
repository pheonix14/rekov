import secrets
from fastapi import APIRouter, HTTPException
from app.schemas.kiosk_schemas import AuthLoginRequest, AuthLoginResponse
from app.services.queue_service import queue_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthLoginResponse)
def login(req: AuthLoginRequest):
    """Authenticate a Doctor or Receptionist using CSV data."""
    # Check Receptionists first
    for rec in queue_service.receptionists.values():
        if rec.id == req.username or rec.name == req.username:
            if rec.pin == req.pin:
                return AuthLoginResponse(
                    token=secrets.token_hex(32),
                    role="RECEPTIONIST",
                    user_id=rec.id,
                    name=rec.name
                )

    # Check Doctors
    for doc in queue_service.doctors.values():
        if doc.id == req.username or doc.name == req.username:
            if doc.pin == req.pin:
                return AuthLoginResponse(
                    token=secrets.token_hex(32),
                    role="DOCTOR",
                    user_id=doc.id,
                    name=doc.name
                )
    
    raise HTTPException(status_code=401, detail="Invalid credentials or PIN")

@router.get("/verify")
def verify_session():
    """Placeholder session verification endpoint."""
    return {"status": "ok", "message": "Session active"}
