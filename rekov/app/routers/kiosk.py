from fastapi import APIRouter, HTTPException, UploadFile, File
import requests
import os
from dotenv import load_dotenv
load_dotenv()
from typing import List
from app.schemas.kiosk_schemas import (
    Department, Doctor, HealthComboPackage, TicketCreateRequest, QueueTicket
)
from app.services.queue_service import queue_service

router = APIRouter(prefix="/kiosk", tags=["Kiosk"])

@router.get("/departments", response_model=List[Department])
def get_departments():
    return list(queue_service.departments.values())

@router.get("/doctors", response_model=List[Doctor])
def get_doctors(department_id: str = None):
    doctors = list(queue_service.doctors.values())
    if department_id:
        doctors = [d for d in doctors if d.department_id == department_id]
    return doctors

@router.get("/combos", response_model=List[HealthComboPackage])
def get_health_combos():
    return list(queue_service.health_combos.values())

@router.post("/ticket", response_model=QueueTicket)
def create_kiosk_ticket(request: TicketCreateRequest):
    ticket = queue_service.create_ticket(request)
    return ticket

from pydantic import BaseModel
class VoiceIntentRequest(BaseModel):
    text: str

@router.post("/voice-intent")
def analyze_voice_intent(request: VoiceIntentRequest):
    text = request.text.lower()
    
    # Basic Hinglish / Hindi / English intent mapper
    # Mappings to known departments
    intents = {
        "dep_card": ["dil", "heart", "seena", "chest", "dhadkan", "cardio", "dharkan", "saans"],
        "dep_ortho": ["haddi", "bone", "dard", "pair", "joint", "back", "kamar", "knee", "ghutna"],
        "dep_ped": ["bacha", "child", "kid", "baby", "pediatric", "bache"],
        "dep_gen": ["bukhar", "fever", "sardi", "cold", "cough", "khasi", "pet", "stomach", "general", "doctor"]
    }
    
    matched_dept = None
    
    for dept_id, keywords in intents.items():
        if any(kw in text for kw in keywords):
            matched_dept = dept_id
            break
            
    if not matched_dept:
        # Fallback to general
        matched_dept = "dep_gen"
        
    return {
        "intent": "book_appointment",
        "department_id": matched_dept,
        "raw_text": request.text
    }

@router.post("/voice-audio")
async def analyze_voice_audio(file: UploadFile = File(...)):
    hf_token = os.getenv("HF_API_TOKEN")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF token not configured")
        
    # We use whisper-large-v3-turbo for excellent multilingual and Hinglish support
    API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo"
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    audio_bytes = await file.read()
    
    response = requests.post(API_URL, headers=headers, data=audio_bytes)
    if response.status_code != 200:
        print("HF API Error:", response.text)
        raise HTTPException(status_code=500, detail="Speech processing failed")
        
    result = response.json()
    text = result.get("text", "")
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
    text_lower = text.lower()
    
    intents = {
        "dep_card": ["dil", "heart", "seena", "chest", "dhadkan", "cardio", "dharkan", "saans"],
        "dep_ortho": ["haddi", "bone", "dard", "pair", "joint", "back", "kamar", "knee", "ghutna", "leg"],
        "dep_ped": ["bacha", "child", "kid", "baby", "pediatric", "bache"],
        "dep_gen": ["bukhar", "fever", "sardi", "cold", "cough", "khasi", "pet", "stomach", "general", "doctor"]
    }
    
    matched_dept = None
    for dept_id, keywords in intents.items():
        if any(kw in text_lower for kw in keywords):
            matched_dept = dept_id
            break
            
    if not matched_dept:
        matched_dept = "dep_gen"
        
    return {
        "intent": "book_appointment",
        "department_id": matched_dept,
        "raw_text": text
    }

@router.get("/history", response_model=List[QueueTicket])
def get_patient_history(lookup: str):
    from app.core.database import SessionLocal, TicketModel
    db = SessionLocal()
    try:
        # Lookup by token_number or patient_phone
        tickets = db.query(TicketModel).filter(
            (TicketModel.token_number == lookup) | (TicketModel.patient_phone == lookup)
        ).order_by(TicketModel.created_at.desc()).all()
        return [queue_service._model_to_schema(t) for t in tickets]
    finally:
        db.close()
