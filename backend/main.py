from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from groq import Groq
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

load_dotenv()

app = FastAPI(title="Event Planner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {'Found' if supabase_url else 'Missing'}")
print(f"Supabase Key: {'Found' if supabase_key else 'Missing'}")

if not supabase_url or not supabase_key:
    print("Warning: Supabase credentials not found. Using mock mode.")
    supabase = None
else:
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("Supabase client created successfully")
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        supabase = None

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Security
security = HTTPBearer()

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

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if supabase is None:
            # Mock user for development when Supabase is not configured
            from types import SimpleNamespace
            mock_user = SimpleNamespace()
            mock_user.id = "mock-user-id"
            mock_user.email = "mock@example.com"
            return mock_user
        
        # Verify JWT token with Supabase
        response = supabase.auth.get_user(credentials.credentials)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Routes
@app.get("/")
async def root():
    return {"message": "Event Planner API"}

@app.get("/events")
async def get_events(current_user = Depends(get_current_user)):
    try:
        if supabase is None:
            # Return mock data for development
            return [
                {
                    "id": "mock-event-1",
                    "name": "Mock Event 1",
                    "description": "This is a mock event for development",
                    "date": "2024-12-01T10:00:00Z",
                    "duration": 60,
                    "location": "Mock Location",
                    "is_public": True,
                    "max_attendees": 10
                }
            ]
        
        response = supabase.table("events").select("*").eq("user_id", current_user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/events")
async def create_event(event: EventCreate, current_user = Depends(get_current_user)):
    try:
        event_data = event.dict()
        event_data["user_id"] = current_user.id
        event_data["id"] = str(uuid.uuid4())
        
        response = supabase.table("events").insert(event_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events/{event_id}")
async def get_event(event_id: str, current_user = Depends(get_current_user)):
    try:
        response = supabase.table("events").select("*").eq("id", event_id).eq("user_id", current_user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/events/{event_id}")
async def update_event(event_id: str, event: EventUpdate, current_user = Depends(get_current_user)):
    try:
        # Check if event exists and belongs to user
        existing_event = supabase.table("events").select("*").eq("id", event_id).eq("user_id", current_user.id).execute()
        if not existing_event.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        update_data = {k: v for k, v in event.dict().items() if v is not None}
        response = supabase.table("events").update(update_data).eq("id", event_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user = Depends(get_current_user)):
    try:
        # Check if event exists and belongs to user
        existing_event = supabase.table("events").select("*").eq("id", event_id).eq("user_id", current_user.id).execute()
        if not existing_event.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        supabase.table("events").delete().eq("id", event_id).execute()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events/{event_id}/guests")
async def get_guests(event_id: str, current_user = Depends(get_current_user)):
    try:
        # Check if event exists and belongs to user
        existing_event = supabase.table("events").select("*").eq("id", event_id).eq("user_id", current_user.id).execute()
        if not existing_event.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        response = supabase.table("guests").select("*").eq("event_id", event_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/events/{event_id}/guests")
async def create_guest(event_id: str, guest: GuestCreate, current_user = Depends(get_current_user)):
    try:
        # Check if event exists and belongs to user
        existing_event = supabase.table("events").select("*").eq("id", event_id).eq("user_id", current_user.id).execute()
        if not existing_event.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        guest_data = guest.dict()
        guest_data["event_id"] = event_id
        guest_data["id"] = str(uuid.uuid4())
        guest_data["invite_link"] = f"https://your-domain.com/book/{event_id}?guest={guest_data['id']}"
        
        response = supabase.table("guests").insert(guest_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/suggest")
async def get_ai_suggestion(request: AISuggestionRequest):
    try:
        # Create a more detailed prompt for better AI responses
        system_prompt = """You are an AI assistant for an event planning application. 
        Help users create professional event names, descriptions, and messaging.
        Provide concise, actionable suggestions that are professional and engaging."""
        
        user_prompt = f"""
        Context: {request.context or 'General event planning'}
        Request: {request.prompt}
        
        Please provide 3 professional suggestions that are:
        - Concise and clear
        - Professional in tone
        - Engaging for attendees
        - Appropriate for the context
        """
        
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return {
            "suggestion": response.choices[0].message.content,
            "model": "llama-3.1-8b-instant"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
