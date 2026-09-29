"""
API Routes for DealMind Backend.
Organized into memory, agent, customer/deal, and health endpoints.
"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import (
    RetainMemoryRequest,
    RecallMemoriesRequest,
    PrepareCallRequest,
    ChatRequest,
    AgentResponse,
)
from backend.services import hindsight_service, llm_service, deal_service
from backend.config import hindsight_config, groq_config

logger = logging.getLogger(__name__)
router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "DealMind API",
        "hindsight_configured": hindsight_config.is_valid(),
        "groq_configured": groq_config.is_valid(),
        "bank_id": hindsight_config.bank_id,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# CUSTOMERS & DEALS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/customers")
async def list_customers():
    """Return all demo customers."""
    customers = deal_service.get_all_customers()
    return {"customers": [c.model_dump() for c in customers]}


@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Return a single customer by ID."""
    customer = deal_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    deals = deal_service.get_deals_for_customer(customer_id)
    return {
        "customer": customer.model_dump(),
        "deals": [d.model_dump() for d in deals],
    }


@router.get("/deals")
async def list_deals():
    """Return all deals."""
    deals = deal_service.get_all_deals()
    return {"deals": [d.model_dump() for d in deals]}


@router.get("/deals/{deal_id}")
async def get_deal(deal_id: str):
    """Return a single deal by ID."""
    deal = deal_service.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail=f"Deal '{deal_id}' not found.")
    return {"deal": deal.model_dump()}


@router.get("/dashboard")
async def get_dashboard():
    """Return dashboard statistics."""
    stats = deal_service.get_dashboard_stats()
    deals = deal_service.get_all_deals()
    customers = deal_service.get_all_customers()
    return {
        "stats": stats,
        "recent_deals": [d.model_dump() for d in deals[:5]],
        "customers": [c.model_dump() for c in customers],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MEMORY — HINDSIGHT INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/memory/retain")
async def retain_memory(request: RetainMemoryRequest):
    """
    RETAIN — Store a sales interaction in Hindsight persistent memory.
    """
    try:
        result = await hindsight_service.retain_memory(
            customer_id=request.customer_id,
            customer_name=request.customer_name,
            content=request.content,
            interaction_type=request.interaction_type,
            deal_id=request.deal_id,
            date=request.date,
        )
        return {
            "status": "success",
            "message": f"Memory retained for {request.customer_name}",
            "hindsight_response": result,
            "operation": "RETAIN",
        }
    except Exception as exc:
        logger.exception("Error during retain")
        raise HTTPException(status_code=500, detail=f"Retain error: {exc}")


@router.post("/memory/recall")
async def recall_memories(request: RecallMemoriesRequest):
    """
    RECALL — Retrieve relevant memories from Hindsight for a customer.
    """
    try:
        memories = await hindsight_service.recall_memories(
            customer_id=request.customer_id,
            customer_name=request.customer_name,
            query=request.query,
            top_k=request.top_k or 10,
        )
        return {
            "status": "success",
            "memories": [m.model_dump() for m in memories],
            "count": len(memories),
            "operation": "RECALL",
        }
    except Exception as exc:
        logger.exception("Error during recall")
        raise HTTPException(status_code=500, detail=f"Recall error: {exc}")


@router.get("/memory/activity/{customer_id}")
async def get_memory_activity(customer_id: str):
    """
    Return the in-session Hindsight memory activity log for a customer.
    """
    activity = hindsight_service.get_activity_log(customer_id)
    return {
        "customer_id": customer_id,
        "activity": [a.model_dump() for a in activity],
        "count": len(activity),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT — AI-POWERED INTELLIGENCE
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/agent/prepare-call")
async def prepare_for_call(request: PrepareCallRequest):
    """
    PREPARE ME FOR THIS CALL — Core DealMind feature.
    """
    deal_info = {
        "deal_name": request.deal_name or "Enterprise AI Platform",
        "deal_stage": request.deal_stage or "Active Negotiation",
        "deal_value": request.deal_value or 120000,
    }

    if request.deal_id:
        deal = deal_service.get_deal(request.deal_id)
        if deal:
            deal_info = {
                "deal_name": deal.name,
                "deal_stage": deal.stage,
                "deal_value": deal.value,
            }

    try:
        recall_query = (
            f"sales interactions, concerns, objections, competitors, stakeholder "
            f"information, commitments, and outcomes for {request.customer_name}"
        )
        memories = await hindsight_service.recall_memories(
            customer_id=request.customer_id,
            customer_name=request.customer_name,
            query=recall_query,
            top_k=15,
        )
    except Exception as exc:
        logger.warning(f"Recall failed during prepare-call: {exc}")
        memories = []

    memories_text = ""
    if memories:
        memories_lines = []
        for i, m in enumerate(memories, 1):
            score_str = f" (relevance: {m.score:.2f})" if m.score else ""
            memories_lines.append(f"{i}. {m.content}{score_str}")
        memories_text = "\n".join(memories_lines)

    try:
        briefing = await llm_service.generate_call_briefing(
            customer_name=request.customer_name,
            deal_info=deal_info,
            memories_text=memories_text,
        )
    except Exception as exc:
        logger.error(f"LLM briefing generation error: {exc}")
        briefing = f"## 📋 Call Briefing for {request.customer_name}\n\nUnable to reach LLM service: {exc}"

    return {
        "status": "success",
        "customer_name": request.customer_name,
        "deal_info": deal_info,
        "memories_recalled": [m.model_dump() for m in memories],
        "memory_count": len(memories),
        "briefing": briefing,
        "memory_powered": len(memories) > 0,
    }


@router.post("/agent/chat")
async def agent_chat(request: ChatRequest):
    """
    DealMind Chat — Contextual Q&A with memory-augmented responses.
    """
    memories = []
    if request.customer_id and request.customer_name:
        try:
            memories = await hindsight_service.recall_memories(
                customer_id=request.customer_id,
                customer_name=request.customer_name,
                query=request.message,
                top_k=8,
            )
        except Exception as exc:
            logger.warning(f"Recall failed in chat: {exc}")

    memories_text = ""
    if memories:
        memories_text = "\n".join(f"• {m.content}" for m in memories)

    try:
        response = await llm_service.generate_chat_response(
            user_message=request.message,
            customer_name=request.customer_name,
            memories_text=memories_text,
            conversation_history=request.conversation_history or [],
        )
    except Exception as exc:
        logger.error(f"Chat generation error: {exc}")
        response = f"I'm sorry, I ran into an error processing your query: {exc}"

    return AgentResponse(
        response=response,
        memories_used=memories,
        memory_count=len(memories),
    )
