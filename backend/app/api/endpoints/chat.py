from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_current_user_api_key
from app.core.security import decrypt_data
from app.core.chat_agent import ChatAgent
from app.repository.db import get_db
from app.repository.chat_repository import ChatRepository
from app.api.dtos.chat_history import MessageDTO
from data.models import User

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    query: str
    conversation_id: int = None 

class ChatResponse(BaseModel):
    response: str
    conversation_id: int = None
    sources: list[str] = []

class NewConversationRequest(BaseModel):
    title: str = "New Chat"

class NewConversationResponse(BaseModel):
    conversation_id: int
    title: str

@router.post("/new", response_model=NewConversationResponse)
def create_conversation(
    request: NewConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ChatRepository(db)
    conv_id = repo.create_conversation(current_user.id, request.title)
    return NewConversationResponse(conversation_id=conv_id, title=request.title)

@router.get("/history", response_model=list[MessageDTO])
def get_history(
    conversation_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    repo = ChatRepository(db)
    return repo.get_user_history(current_user.id, conversation_id=conversation_id)

@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    api_key: str = Depends(get_current_user_api_key),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ChatRepository(db)

    formatted_history = []
    if request.conversation_id:
        db_history = repo.get_user_history(current_user.id, conversation_id=request.conversation_id)
        for msg in db_history:
            formatted_history.append({"role": "user", "parts": [{"text": msg.query}]})
            formatted_history.append({"role": "model", "parts": [{"text": msg.response}]})

    try:
        agent = ChatAgent(api_key=api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Chat Agent: {str(e)}")

    response_text, sources = agent.generate_response(request.query, history=formatted_history)

    repo.create_message(
        user_id=current_user.id,
        query=request.query,
        response=response_text,
        conversation_id=request.conversation_id
    )

    return ChatResponse(
        response=response_text,
        conversation_id=request.conversation_id,
        sources=sources
    )
