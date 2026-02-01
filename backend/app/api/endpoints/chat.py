from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_current_user_api_key
from app.core.security import decrypt_data
from app.core.chat_agent import ChatAgent
from app.repository.db import get_db
from app.repository.chat_repository import ChatRepository
from app.api.dtos.chat_history import MessageDTO
from app.api.dtos.conversation_history import ConversationHistory
from data.models import User

router = APIRouter(prefix="/chat", tags=["chat"])

from typing import Optional

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[int] = None 

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[int] = None
    sources: list[str] = []
    title: Optional[str] = None

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

@router.get("/conversations", response_model=list[ConversationHistory])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ChatRepository(db)
    return repo.get_user_conversations(current_user.id)

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ChatRepository(db)
    success = repo.delete_conversation(conversation_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")
    return {"message": "Conversation deleted successfully"}

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

    new_title = None
    if request.conversation_id:
        conversation = repo.get_conversation(request.conversation_id)
        if conversation and conversation.title in ["New Chat", "Nowy czat"]:
            try:
                generated_title = agent.generate_title(request.query, response_text)
                repo.update_conversation_title(request.conversation_id, generated_title)
                new_title = generated_title
            except Exception as e:
                print(f"Failed to generate title: {e}")

    return ChatResponse(
        response=response_text,
        conversation_id=request.conversation_id,
        sources=sources,
        title=new_title
    )
