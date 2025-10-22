from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI(title="MeetBase API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: str
    duration: int
    location: Optional[str] = None
    event_password: Optional[str] = None
    is_public: bool = False
    max_attendees: Optional[int] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    event_password: Optional[str] = None
    is_public: Optional[bool] = None
    max_attendees: Optional[int] = None

class GuestCreate(BaseModel):
    name: str
    email: str
    notes: Optional[str] = None

class AISuggestionRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

# In-memory storage for development
events_db = []
guests_db = []

# Routes
@app.get("/")
async def root():
    return {"message": "MeetBase API - Development Mode", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "MeetBase API"}

@app.get("/events")
async def get_events():
    """Get all events (mock data for development)"""
    return events_db

@app.post("/events")
async def create_event(event: EventCreate):
    """Create a new event"""
    event_data = event.dict()
    event_data["id"] = str(uuid.uuid4())
    event_data["user_id"] = "mock-user-id"
    event_data["created_at"] = datetime.now().isoformat()
    event_data["updated_at"] = datetime.now().isoformat()
    
    events_db.append(event_data)
    return event_data

@app.get("/events/{event_id}")
async def get_event(event_id: str):
    """Get a specific event"""
    event = next((e for e in events_db if e["id"] == event_id), None)
    if not event:
        return {"error": "Event not found"}
    return event

@app.put("/events/{event_id}")
async def update_event(event_id: str, event: EventUpdate):
    """Update an event"""
    event_index = next((i for i, e in enumerate(events_db) if e["id"] == event_id), None)
    if event_index is None:
        return {"error": "Event not found"}
    
    update_data = {k: v for k, v in event.dict().items() if v is not None}
    events_db[event_index].update(update_data)
    events_db[event_index]["updated_at"] = datetime.now().isoformat()
    
    return events_db[event_index]

@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    """Delete an event"""
    global events_db
    events_db = [e for e in events_db if e["id"] != event_id]
    return {"message": "Event deleted successfully"}

@app.get("/events/{event_id}/guests")
async def get_guests(event_id: str):
    """Get guests for an event"""
    event_guests = [g for g in guests_db if g["event_id"] == event_id]
    return event_guests

@app.post("/events/{event_id}/guests")
async def create_guest(event_id: str, guest: GuestCreate):
    """Create a guest for an event"""
    guest_data = guest.dict()
    guest_data["id"] = str(uuid.uuid4())
    guest_data["event_id"] = event_id
    guest_data["status"] = "pending"
    guest_data["invite_link"] = f"https://your-domain.com/book/{event_id}?guest={guest_data['id']}"
    guest_data["invited_at"] = datetime.now().isoformat()
    
    guests_db.append(guest_data)
    return guest_data

@app.post("/ai/suggest")
async def get_ai_suggestion(request: AISuggestionRequest):
    """Get AI suggestions (mock responses for development)"""
    mock_suggestions = [
        "Professional networking event",
        "Team building workshop", 
        "Business conference",
        "Product launch celebration",
        "Client appreciation dinner"
    ]
    
    # Return a mock suggestion
    import random
    suggestion = random.choice(mock_suggestions)
    
    return {
        "suggestion": f"Here are some suggestions for your event:\n1. {suggestion}\n2. {random.choice(mock_suggestions)}\n3. {random.choice(mock_suggestions)}",
        "model": "mock-ai-model"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MeetBase API in development mode...")
    print("📝 Note: Using mock data - no database connection required")
    print("🌐 API will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
