# Realtime Leaf Detection System

A real-time leaf detection and species classification system using YOLOv8 for leaf detection and a custom CNN for species classification.

## Architecture

Four independent services:
- **Frontend** — React 18 + Vite + Tailwind CSS
- **Backend** — Express.js + Mongoose
- **AI Service** — FastAPI + PyTorch (YOLOv8 + CNN)
- **Database** — MongoDB

## Supported Species
- Mango
- Guava
- Jamun (Java Plum)
- Ashoka
- Pomegranate

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

### Quick Start (Docker)
```bash
docker compose up --build
```

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your config
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Documentation
Once the backend is running, see the API routes in `backend/src/routes/`.
Once the AI service is running, visit `http://localhost:8000/docs` for auto-generated OpenAPI docs.

## Project Structure
```
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express.js REST API
├── ai-service/        # FastAPI ML service
├── docker-compose.yml
└── docs/              # SRS, DFDs, Data Dictionary
```
