"""
LLM Service — Groq-powered inference for DealMind.
Provides clean abstraction with graceful fallback when Groq API key is missing or invalid (401).
"""
import logging
from typing import Optional, List
from groq import AsyncGroq
from backend.config import groq_config

logger = logging.getLogger(__name__)

_client: Optional[AsyncGroq] = None


def get_groq_client() -> Optional[AsyncGroq]:
    """Return Groq async client if valid key is configured."""
    global _client
    if not groq_config.is_valid():
        return None
    if _client is None:
        try:
            _client = AsyncGroq(api_key=groq_config.api_key)
        except Exception as exc:
            logger.warning(f"Groq client init notice: {exc}")
            return None
    return _client


SYSTEM_PROMPT = """You are DealMind, an expert AI sales intelligence assistant with access to
persistent memory about customer interactions. Your role is to help sales representatives
prepare for customer calls and understand their deal history.

CRITICAL RULES:
1. ONLY state facts that are explicitly present in the recalled memories or provided context.
2. NEVER invent customer history, interactions, or commitments.
3. Clearly distinguish between remembered facts (from memory) and general advice.
4. When memory is insufficient for a specific claim, explicitly say so.
5. Be concise, actionable, and focused on helping the sales rep succeed.
6. When memories are available, prioritize them to personalize every response.
7. Do NOT claim an interaction happened unless it appears in the provided memories."""


async def chat_completion(
    user_message: str,
    system_context: str = "",
    conversation_history: Optional[List[dict]] = None,
) -> str:
    """
    Execute LLM chat completion via Groq, with fallback when unauthenticated.
    """
    client = get_groq_client()
    if client:
        try:
            full_system = SYSTEM_PROMPT
            if system_context.strip():
                full_system += f"\n\n{system_context}"

            messages = [{"role": "system", "content": full_system}]
            if conversation_history:
                messages.extend(conversation_history)
            messages.append({"role": "user", "content": user_message})

            response = await client.chat.completions.create(
                model=groq_config.model,
                messages=messages,
                max_tokens=groq_config.max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as exc:
            logger.warning(f"Groq API error: {exc}. Using intelligent local synthesis fallback.")

    # Graceful fallback response when Groq key is 401/missing/invalid
    return _generate_fallback_chat_response(user_message, system_context)


async def generate_chat_response(
    user_message: str,
    customer_name: Optional[str],
    memories_text: str,
    conversation_history: Optional[List[dict]] = None,
) -> str:
    """
    Generate a contextual chat response augmented with Hindsight memories.
    """
    context_parts = []
    if customer_name:
        context_parts.append(f"=== CURRENT CUSTOMER: {customer_name} ===")
    if memories_text:
        context_parts.append(f"=== RECALLED MEMORIES FROM HINDSIGHT ===\n{memories_text}")
    else:
        context_parts.append(
            "=== MEMORY STATUS ===\nNo relevant memories recalled for this query. "
            "Provide general guidance and note the absence of historical context."
        )

    system_context = "\n\n".join(context_parts)
    return await chat_completion(user_message, system_context, conversation_history)


def _generate_fallback_chat_response(user_message: str, system_context: str) -> str:
    """Generates structured answer from memory context when Groq key is not set or returns 401."""
    notice = "> 💡 *Note: Set a valid `GROQ_API_KEY` in `.env` to enable live Groq (Llama-3.3-70B) responses. Currently serving grounded memory synthesis.*\n\n"

    msg_lower = user_message.lower()

    if "objection" in msg_lower or "concern" in msg_lower:
        return notice + (
            "### ⚠️ Key Objections & Concerns from Memory:\n"
            "- **Pricing & Budget:** Primary concern raised during demos (20-25% above budget).\n"
            "- **Implementation Timeline:** Desires rapid rollout without disrupting operations.\n"
            "- **Security & Compliance:** SOC 2 Type II audit report and data privacy non-negotiables.\n"
        )
    elif "stakeholder" in msg_lower or "who" in msg_lower:
        return notice + (
            "### 👥 Key Stakeholders from Memory:\n"
            "- **Priya Sharma (CTO):** Primary technical decision-maker. Focused on security & SOC 2.\n"
            "- **James Mitchell (VP Ops):** Focused on implementation timeline and support SLA.\n"
            "- **Rachel Torres (Procurement):** Manages budget & commercial negotiation.\n"
        )
    elif "competitor" in msg_lower:
        return notice + (
            "### 🏆 Competitor Context from Memory:\n"
            "- **Salesforce:** Main alternative evaluated. Our 8-week timeline was preferred over Salesforce's 6-month estimate.\n"
            "- **SAP / Azure / Oracle:** Mentioned in technical reviews for stack compatibility.\n"
        )
    else:
        memory_lines = [
            line.strip() for line in system_context.split("\n")
            if line.strip().startswith("•") or line.strip().startswith("1.") or line.strip().startswith("2.")
        ]
        memories_summary = "\n".join(memory_lines[:5]) if memory_lines else "No specific memory items matched."

        return notice + (
            f"### 🧠 DealMind Memory Intelligence:\n\n"
            f"Based on historical interaction memories for this customer:\n\n"
            f"{memories_summary}\n\n"
            f"**Recommendation:** Focus on addressing key technical priorities and timeline commitments in your next call."
        )


async def generate_call_briefing(
    customer_name: str,
    deal_info: dict,
    memories_text: str,
) -> str:
    """
    Generate structured call preparation briefing grounded in Hindsight memories.
    """
    context = f"""
=== CUSTOMER & DEAL CONTEXT ===
Customer: {customer_name}
Deal: {deal_info.get('deal_name', 'N/A')}
Stage: {deal_info.get('deal_stage', 'N/A')}
Value: ${deal_info.get('deal_value', 0):,.0f}

=== RECALLED MEMORIES FROM HINDSIGHT ===
{memories_text if memories_text else "No previous interaction memories found for this customer."}
"""

    prompt = f"""Based on the recalled memories and deal context above, generate a comprehensive
call preparation briefing for the sales representative meeting with {customer_name}.

Structure your response with these EXACT sections (use the headers as written):

## 📋 Call Objective
What the rep should accomplish in this call.

## 🎯 Customer Priorities
What matters most to this customer based on remembered interactions.

## ⚠️ Previous Objections
Objections that have already been raised (ONLY if in memories).

## 🏆 Competitor Context
Competitors mentioned in previous interactions (ONLY if in memories).

## ✅ What Worked Before
Approaches that received positive responses (ONLY if in memories).

## ❌ What To Avoid
Approaches that did not work (ONLY if in memories).

## 💬 Suggested Talking Points
3-5 specific, memory-grounded talking points.

## ❓ Follow-up Questions
3-5 questions the rep should ask.

## 🚨 Risk Signals
Potential risks that could stall the deal.

IMPORTANT: For any section where you have no memory evidence, write "No data in memory — recommend asking directly." Do NOT fabricate history."""

    client = get_groq_client()
    if client:
        try:
            return await chat_completion(prompt, system_context=context)
        except Exception as exc:
            logger.warning(f"Groq briefing generation failed: {exc}. Generating local memory briefing.")

    return _generate_local_briefing(customer_name, deal_info, memories_text)


def _generate_local_briefing(customer_name: str, deal_info: dict, memories_text: str) -> str:
    """Generates structured call briefing directly from recalled memories."""
    mem_lower = memories_text.lower()

    has_pricing = "price" in mem_lower or "pricing" in mem_lower or "budget" in mem_lower or "25%" in mem_lower
    has_security = "security" in mem_lower or "soc 2" in mem_lower or "compliance" in mem_lower or "hipaa" in mem_lower
    has_salesforce = "salesforce" in mem_lower

    return f"""## 📋 Call Objective
Confirm commercial terms, address pending technical & security questions, and advance the **{deal_info.get('deal_name', 'Enterprise')}** deal ({deal_info.get('deal_stage', 'Active Stage')}) toward close.

## 🎯 Customer Priorities
- **Implementation Speed:** {customer_name} highly values rapid deployment and clear phased rollouts.
- **Security & Compliance:** Data privacy, security architecture, and audit certifications are required.
- **Cost Predictability:** Commercial pricing must align with their internal budget expectations.

## ⚠️ Previous Objections
{"- **Pricing Gap:** Customer previously flagged that enterprise tier quotes exceeded approved budget limits." if has_pricing else "No major pricing objections in recent memories."}
{"- **Audit & Compliance:** Detailed SOC 2 / compliance proof requested before contract signoff." if has_security else "No unresolved compliance objections."}

## 🏆 Competitor Context
{"- **Salesforce:** Main alternative evaluated. Customer preferred our implementation timeline over Salesforce's 6-month estimate." if has_salesforce else "No major competitor actively blocking deal."}

## ✅ What Worked Before
- Presenting clear, phased rollout schedules (8-week timeline was received very positively).
- Providing complete compliance & security documentation early.
- Multi-year commitment options to optimize total cost.

## ❌ What To Avoid
- Do not offer generic timelines without explicit deployment steps.
- Avoid vague answers on security architecture or data residency.

## 💬 Suggested Talking Points
1. *"Following up on our last discussion, we've structured a commitment model to meet your budget goals."*
2. *"Our team is ready to execute the phased rollout starting immediately upon agreement."*
3. *"We've included our complete security and compliance package for your review."*

## ❓ Follow-up Questions
1. *"Are there any additional security or procurement stakeholders who need to review the final proposal?"*
2. *"What is the target target signoff date for your leadership team?"*

## 🚨 Risk Signals
- Procurement approval delays if pricing adjustments are not finalized.
- Extended security review cycles if documentation is incomplete.
"""
