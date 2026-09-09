# rekov - HealthExpress Kiosk System

A high-performance, fast-food inspired self-service hospital kiosk and queue management system.

## Overview
Built with **Next.js 14 (App Router)** and **Python FastAPI**. It features a touch-optimized patient kiosk, a live TV-style queue display board, and a clinical desk dashboard for doctors.

## Features
- **Express Triage Kiosk:** Patients input vitals (BP, HR, Temp, Pain Scale) directly into a touch interface.
- **Health Combos:** Fast-food style cart for ordering diagnostic add-ons (e.g. ECG + Lipid panel).
- **Live TV Queue Board:** Real-time visual updates and Web Speech API audio announcements.
- **Smart Triage Priority:** Automated priority calculation (EMERGENCY, URGENT, STANDARD) based on patient-reported vitals.
- **Doctor Desk:** Control panel to call next patient and manage consultation status.

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

### Run Manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd rekoviu
npm install
npm run dev
```

## Deployment (Render)
This repository is configured for 1-click deployment on [Render](https://render.com) using the included `render.yaml` blueprint. It deploys two Docker Web Services: one for FastAPI and one for Next.js.
