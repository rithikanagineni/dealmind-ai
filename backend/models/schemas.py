"""
DealMind Pydantic Models
Defines request/response schemas for the API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Memory Models ─────────────────────────────────────────────────────────────

class RetainMemoryRequest(BaseModel):
    customer_id: str = Field(..., description="Customer identifier")
    customer_name: str = Field(..., description="Human-readable customer name")
    deal_id: Optional[str] = Field(None, description="Deal identifier")
    interaction_type: str = Field(..., description="Type of interaction, e.g. 'customer call'")
    content: str = Field(..., description="Content to retain in memory")
    date: Optional[str] = Field(None, description="ISO date string of the interaction")


class RecallMemoriesRequest(BaseModel):
    customer_id: str = Field(..., description="Customer identifier")
    customer_name: str = Field(..., description="Human-readable customer name")
    query: str = Field(..., description="What to recall")
    top_k: Optional[int] = Field(10, description="Max number of memories to return")


class MemoryItem(BaseModel):
    content: str
    score: Optional[float] = None
    timestamp: Optional[str] = None


class MemoryActivityItem(BaseModel):
    operation: str  # "retained" | "recalled"
    content: str
    timestamp: str


# ─── Agent Models ──────────────────────────────────────────────────────────────

class PrepareCallRequest(BaseModel):
    customer_id: str
    customer_name: str
    deal_id: Optional[str] = None
    deal_name: Optional[str] = None
    deal_stage: Optional[str] = None
    deal_value: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    deal_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = Field(default_factory=list)


class AgentResponse(BaseModel):
    response: str
    memories_used: List[MemoryItem] = Field(default_factory=list)
    memory_count: int = 0


# ─── Customer / Deal Models ────────────────────────────────────────────────────

class Stakeholder(BaseModel):
    name: str
    title: str
    email: Optional[str] = None
    influence: str = "medium"  # high | medium | low


class Interaction(BaseModel):
    id: str
    date: str
    type: str
    summary: str
    outcome: str


class Customer(BaseModel):
    id: str
    name: str
    industry: str
    company_size: str
    website: Optional[str] = None
    stakeholders: List[Stakeholder] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    competitors: List[str] = Field(default_factory=list)
    recent_interactions: List[Interaction] = Field(default_factory=list)


class Deal(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    name: str
    stage: str
    value: float
    probability: int
    close_date: Optional[str] = None
    description: Optional[str] = None
