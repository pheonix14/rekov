from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.services.queue_service import queue_service
from app.schemas.kiosk_schemas import Doctor, Department
import uuid

router = APIRouter()

class PricingUpdateRequest(BaseModel):
    doctor_id: str
    new_fee: float

class DoctorCreateRequest(BaseModel):
    name: str
    department_id: str
    specialty: str
    room_number: str
    consultation_fee: float
    experience_years: int
    arrival_time: Optional[str] = None

class DepartmentCreateRequest(BaseModel):
    name: str
    code: str
    description: str

@router.get("/doctors", response_model=List[Doctor])
def get_doctors():
    return list(queue_service.doctors.values())

@router.post("/doctors", response_model=Doctor)
def add_doctor(req: DoctorCreateRequest):
    if req.department_id not in queue_service.departments:
        raise HTTPException(status_code=400, detail="Department not found")
        
    doc_id = f"doc_{uuid.uuid4().hex[:6]}"
    new_doc = Doctor(
        id=doc_id,
        name=req.name,
        department_id=req.department_id,
        specialty=req.specialty,
        room_number=req.room_number,
        is_available=True,
        estimated_wait_minutes=5,
        consultation_fee=req.consultation_fee,
        rating=5.0,
        experience_years=req.experience_years,
        arrival_time=req.arrival_time
    )
    queue_service.doctors[doc_id] = new_doc
    queue_service.save_data()
    return new_doc

@router.put("/doctors/{doctor_id}/arrival")
def update_doctor_arrival(doctor_id: str, arrival_time: str):
    if doctor_id not in queue_service.doctors:
        raise HTTPException(status_code=404, detail="Doctor not found")
    queue_service.doctors[doctor_id].arrival_time = arrival_time
    queue_service.save_data()
    return queue_service.doctors[doctor_id]

@router.post("/departments", response_model=Department)
def add_department(req: DepartmentCreateRequest):
    dep_id = f"dep_{req.code.lower()}"
    new_dep = Department(
        id=dep_id,
        name=req.name,
        code=req.code.upper(),
        description=req.description,
        active_doctors_count=0,
        wait_time_minutes=0
    )
    queue_service.departments[dep_id] = new_dep
    queue_service.save_data()
    return new_dep

@router.put("/pricing", response_model=Doctor)
def update_pricing(req: PricingUpdateRequest):
    if req.doctor_id not in queue_service.doctors:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    queue_service.doctors[req.doctor_id].consultation_fee = req.new_fee
    queue_service.save_data()
    return queue_service.doctors[req.doctor_id]
