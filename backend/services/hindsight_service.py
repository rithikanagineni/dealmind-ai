"""
Hindsight Service — DealMind's Persistent Memory Layer

Uses the official hindsight-client SDK (pip install hindsight-client).
All operations use the async-native SDK methods (aretain, arecall, areflect).

Includes graceful handling: if Hindsight Cloud API credentials are valid, it communicates
with Hindsight Cloud. If API credentials are missing, placeholder, or return 401, it
falls back to local memory storage so the app works continuously without error screens.
"""
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from hindsight_client import Hindsight
from backend.config import hindsight_config
from backend.models.schemas import MemoryItem, MemoryActivityItem

logger = logging.getLogger(__name__)

# In-session activity log for the UI panel
_memory_activity_log: Dict[str, List[MemoryActivityItem]] = {}

# Fallback local memory store for demo mode / unauthenticated mode
_local_memory_store: Dict[str, List[Dict[str, Any]]] = {
    "acme-corp": [
        {
            "content": "First discovery call with Acme Corporation. Evaluated multiple vendors including Salesforce for enterprise AI. Priya Sharma (CTO) concerned about enterprise pricing (20-30% above budget). Needs business case justification.",
            "timestamp": "2026-08-10",
        },
        {
            "content": "Follow-up email: CTO Priya Sharma requested SOC 2 Type II compliance documentation and security architecture overview. Stated data security and regulatory compliance are non-negotiable requirements.",
            "timestamp": "2026-08-20",
        },
        {
            "content": "Product demo: Priya Sharma, James Mitchell (VP Ops), and Rachel Torres (Procurement) attended. Responded very positively to 8-week implementation timeline (vs Salesforce 6-month deployment). Rachel Torres flagged pricing is 25% above approved budget.",
            "timestamp": "2026-09-05",
        },
        {
            "content": "Technical review with CTO Priya Sharma. Security architecture discussion went extremely well — zero-trust model and SOC 2 Type II audit report relieved her concerns. Pricing still 25% above budget, Priya asked for multi-year pricing discount.",
            "timestamp": "2026-09-15",
        },
        {
            "content": "Commercial negotiation call with James Mitchell and Rachel Torres. Presented 3-year commitment pricing model with 18% discount. Rachel Torres responded positively. James Mitchell requested dedicated Customer Success Manager SLA during Year 1.",
            "timestamp": "2026-09-22",
        },
    ],
    "novatech": [
        {
            "content": "Discovery call with CEO Alex Reyes. Wants to automate DevOps workflows before Q4 budget freeze. Concerned about integration complexity with existing AWS stack. Comparing with Google Cloud AI and Microsoft Azure AI.",
            "timestamp": "2026-09-01",
        }
    ],
    "vertex-health": [
        {
            "content": "Needs assessment with CMO Dr. Lisa Park and CIO Tom Bradley. HIPAA compliance & BAA are non-negotiable. Dr. Park focused on clinical AI diagnostic support. Evaluated Epic Systems and Oracle Health previously.",
            "timestamp": "2026-09-05",
        }
    ],
    "orbit-financial": [
        {
            "content": "Technical review with VP Tech Diana Foster and CRO Marcus Chen. Marcus raised concerns about audit trail completeness for regulatory reporting. Requires US data residency. Comparing with Bloomberg Terminal AI.",
            "timestamp": "2026-09-18",
        }
    ],
    "bluepeak-retail": [
        {
            "content": "Discovery call with CMO Sarah Johnson. Wants AI personalization live before Black Friday (Nov 28). Salesforce Commerce Cloud pitched a similar solution. Fixed-price annual contract required due to overage concerns.",
            "timestamp": "2026-09-25",
        }
    ]
}

# Lazily initialized Hindsight SDK client
_client: Optional[Hindsight] = None


def _get_client() -> Optional[Hindsight]:
    """Return initialized Hindsight SDK client if valid API key is set."""
    global _client
    if not hindsight_config.is_valid():
        return None
    if _client is None:
        try:
            _client = Hindsight(
                base_url=hindsight_config.base_url,
                api_key=hindsight_config.api_key,
                timeout=60.0,
            )
            logger.info(f"Hindsight SDK client initialized → {hindsight_config.base_url}")
        except Exception as exc:
            logger.warning(f"Failed to create Hindsight client: {exc}")
            return None
    return _client


def _log_activity(customer_id: str, operation: str, content: str):
    """Append to the in-session activity log for a customer."""
    if customer_id not in _memory_activity_log:
        _memory_activity_log[customer_id] = []
    _memory_activity_log[customer_id].append(
        MemoryActivityItem(
            operation=operation,
            content=content[:250],
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    )
    _memory_activity_log[customer_id] = _memory_activity_log[customer_id][-50:]


def get_activity_log(customer_id: str) -> List[MemoryActivityItem]:
    """Return the in-session memory activity log for a customer."""
    return _memory_activity_log.get(customer_id, [])


async def ensure_bank_exists() -> bool:
    """Create the memory bank if valid client is available."""
    client = _get_client()
    if not client:
        return True
    try:
        await client.acreate_bank(
            bank_id=hindsight_config.bank_id,
            reflect_mission=(
                "You are a sales intelligence assistant. Extract and remember key facts "
                "about customer interactions: pain points, objections, competitors, "
                "pricing, stakeholders, and commitments."
            ),
        )
        logger.info(f"Memory bank '{hindsight_config.bank_id}' ready.")
        return True
    except Exception as exc:
        logger.warning(f"Bank setup notice: {exc}")
        return True


async def retain_memory(
    customer_id: str,
    customer_name: str,
    content: str,
    interaction_type: str = "interaction",
    deal_id: Optional[str] = None,
    date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    RETAIN operation — Store a sales interaction in Hindsight (or local memory fallback).
    """
    enriched_content = (
        f"[Customer: {customer_name}] [CustomerID: {customer_id}] "
        f"[Type: {interaction_type}] "
        f"[Date: {date or datetime.now(timezone.utc).strftime('%Y-%m-%d')}]\n"
        f"{content}"
    )

    client = _get_client()
    if client:
        try:
            tags = [customer_id, customer_name.lower().replace(" ", "-")]
            if deal_id:
                tags.append(deal_id)

            metadata = {
                "customer_id": customer_id,
                "customer_name": customer_name,
                "interaction_type": interaction_type,
            }

            result = await client.aretain(
                bank_id=hindsight_config.bank_id,
                content=enriched_content,
                context=f"Sales interaction with {customer_name}: {interaction_type}",
                metadata=metadata,
                tags=tags,
            )
            _log_activity(customer_id, "retained", content[:250])
            return {"status": "retained", "response": str(result), "mode": "hindsight_cloud"}
        except Exception as exc:
            logger.warning(f"Hindsight Cloud retain error: {exc}. Using local memory fallback.")

    # Local memory fallback
    if customer_id not in _local_memory_store:
        _local_memory_store[customer_id] = []
    _local_memory_store[customer_id].append({
        "content": enriched_content,
        "timestamp": date or datetime.now(timezone.utc).strftime('%Y-%m-%d'),
    })

    _log_activity(customer_id, "retained", content[:250])
    return {
        "status": "retained",
        "mode": "local_fallback",
        "message": "Retained in local memory (add valid HINDSIGHT_API_KEY to .env for Cloud persistence)",
    }


async def recall_memories(
    customer_id: str,
    customer_name: str,
    query: str,
    top_k: int = 10,
) -> List[MemoryItem]:
    """
    RECALL operation — Retrieve relevant memories for a customer.
    """
    client = _get_client()
    if client:
        try:
            augmented_query = f"Customer {customer_name} (ID: {customer_id}): {query}"
            response = await client.arecall(
                bank_id=hindsight_config.bank_id,
                query=augmented_query,
                max_tokens=top_k * 300,
                budget="mid",
                include_entities=True,
                max_entity_tokens=200,
            )

            memories: List[MemoryItem] = []
            for item in (response.results or []):
                memories.append(
                    MemoryItem(
                        content=item.text,
                        score=getattr(item, "score", None),
                        timestamp=str(getattr(item, "mentioned_at", None) or ""),
                    )
                )

            filtered = [
                m for m in memories
                if (
                    customer_name.lower() in m.content.lower()
                    or customer_id.lower() in m.content.lower()
                    or customer_name.split()[0].lower() in m.content.lower()
                )
            ]
            result = filtered if filtered else memories
            if result:
                _log_activity(customer_id, "recalled", f"Query: '{query[:100]}' → {len(result)} memories retrieved")
                return result
        except Exception as exc:
            logger.warning(f"Hindsight Cloud recall error: {exc}. Using local memory fallback.")

    # Local memory fallback recall
    stored = _local_memory_store.get(customer_id, [])
    query_words = [w.lower() for w in query.split() if len(w) > 3]

    results: List[MemoryItem] = []
    for item in stored:
        content = item["content"]
        # Basic keyword relevance calculation
        matches = sum(1 for w in query_words if w in content.lower())
        score = 0.5 + (0.1 * matches)
        results.append(MemoryItem(content=content, score=min(score, 0.99), timestamp=item.get("timestamp")))

    # Sort by relevance
    results.sort(key=lambda m: m.score or 0, reverse=True)
    recalled = results[:top_k]

    _log_activity(customer_id, "recalled", f"Query: '{query[:100]}' → {len(recalled)} memories retrieved")
    return recalled


async def reflect_on_memories(
    customer_id: str,
    customer_name: str,
    query: str,
) -> str:
    """
    REFLECT operation — Synthesize memories into high-level insights.
    """
    client = _get_client()
    if client:
        try:
            response = await client.areflect(
                bank_id=hindsight_config.bank_id,
                query=f"Customer {customer_name}: {query}",
                budget="mid",
                context=f"Analyzing sales history for {customer_name}",
            )
            if response and response.text:
                _log_activity(customer_id, "reflected", query[:250])
                return response.text
        except Exception as exc:
            logger.warning(f"Hindsight Cloud reflect error: {exc}. Using recall synthesis fallback.")

    memories = await recall_memories(customer_id, customer_name, query, top_k=15)
    if not memories:
        return "No historical interactions found to reflect upon."
    return "\n".join(f"• {m.content}" for m in memories)
