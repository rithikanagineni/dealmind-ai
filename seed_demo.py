#!/usr/bin/env python3
"""
DealMind Demo Seed Script
==========================
Seeds realistic historical sales interactions into Hindsight memory.

This script ACTUALLY calls the Hindsight retain API — no local storage.
Run AFTER starting the DealMind backend.

Usage:
    # Seed via backend API (recommended — backend handles auth)
    py seed_demo.py

    # Or with a specific backend URL
    py seed_demo.py --backend http://localhost:8000

Requirements:
    - .env file with HINDSIGHT_API_KEY, HINDSIGHT_BASE_URL, HINDSIGHT_BANK_ID
    - Backend running at BACKEND_URL
"""
import asyncio
import argparse
import sys
import os
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

import httpx

BACKEND_URL = "http://localhost:8000"

# ─── Demo Interaction Scenarios ────────────────────────────────────────────────
# These represent realistic historical sales interactions.
# Each one is stored in Hindsight via the retain API.

DEMO_MEMORIES = [
    # ─── ACME CORPORATION ───────────────────────────────────────────────────
    {
        "customer_id": "acme-corp",
        "customer_name": "Acme Corporation",
        "deal_id": "deal-acme-001",
        "interaction_type": "Discovery Call",
        "date": "2026-08-10",
        "content": (
            "First discovery call with Acme Corporation. "
            "They are evaluating multiple vendors including Salesforce for their enterprise AI platform. "
            "The team is concerned about enterprise pricing — they feel current vendor quotes are 20-30% above their budget. "
            "Key decision maker is CTO Priya Sharma who expressed strong interest but needs business case justification."
        ),
    },
    {
        "customer_id": "acme-corp",
        "customer_name": "Acme Corporation",
        "deal_id": "deal-acme-001",
        "interaction_type": "Follow-up Email",
        "date": "2026-08-20",
        "content": (
            "Sent follow-up email after discovery call to Acme Corporation. "
            "CTO Priya Sharma replied requesting detailed SOC 2 Type II compliance documentation and security architecture overview. "
            "She stated that data security and regulatory compliance are non-negotiable requirements for Acme. "
            "James Mitchell (VP Operations) was cc'd on the email and mentioned implementation timeline concerns."
        ),
    },
    {
        "customer_id": "acme-corp",
        "customer_name": "Acme Corporation",
        "deal_id": "deal-acme-001",
        "interaction_type": "Product Demo",
        "date": "2026-09-05",
        "content": (
            "Delivered full product demo to Acme Corporation. Priya Sharma, James Mitchell, and Rachel Torres attended. "
            "The team responded very positively when we walked through our 8-week implementation timeline. "
            "James Mitchell specifically praised the phased rollout approach compared to Salesforce's 6-month deployment. "
            "Pricing objection re-emerged — Rachel Torres from Procurement said our enterprise tier is 25% above their approved budget. "
            "Priya Sharma asked about multi-year pricing discounts. Competitor: Salesforce was mentioned as primary alternative."
        ),
    },
    {
        "customer_id": "acme-corp",
        "customer_name": "Acme Corporation",
        "deal_id": "deal-acme-001",
        "interaction_type": "Technical Review",
        "date": "2026-09-15",
        "content": (
            "Technical deep-dive with Acme's engineering team. Led by CTO Priya Sharma. "
            "Security architecture discussion went extremely well — Priya was impressed by our zero-trust model. "
            "We confirmed SOC 2 Type II certification and shared the audit report. This visibly relieved her concerns. "
            "The team compared our API design favorably against Salesforce's integration complexity. "
            "Outstanding issue: pricing still at 25% above budget. Priya suggested she could make a case internally "
            "if we can offer multi-year commitment pricing. We committed to sending a revised commercial proposal."
        ),
    },
    {
        "customer_id": "acme-corp",
        "customer_name": "Acme Corporation",
        "deal_id": "deal-acme-001",
        "interaction_type": "Commercial Negotiation",
        "date": "2026-09-22",
        "content": (
            "Negotiation call with Acme Corporation. James Mitchell and Rachel Torres led from Acme side. "
            "We presented a 3-year commitment pricing model with 18% discount vs list price. "
            "Rachel Torres responded positively — this brings pricing within 8% of their budget. "
            "James Mitchell raised a new concern about dedicated support SLA during Year 1 implementation. "
            "He wants a named Customer Success Manager assigned exclusively to Acme. "
            "We agreed to explore this and provide a revised proposal by end of week. "
            "Priya Sharma was not on this call but James said she is ready to approve if pricing and support are resolved."
        ),
    },
    # ─── NOVATECH SYSTEMS ───────────────────────────────────────────────────
    {
        "customer_id": "novatech",
        "customer_name": "NovaTech Systems",
        "deal_id": "deal-novatech-001",
        "interaction_type": "Discovery Call",
        "date": "2026-09-01",
        "content": (
            "Discovery call with NovaTech Systems CEO Alex Reyes. "
            "NovaTech is a fast-growing tech company that wants to automate their DevOps workflows. "
            "Alex is enthusiastic about AI capabilities but concerned about integration complexity with their existing AWS stack. "
            "They currently use Microsoft Azure AI for some workloads and are comparing us against Google Cloud AI. "
            "Key requirement: solution must integrate with Jira, GitHub, and their Kubernetes clusters. "
            "Timeline pressure — Alex wants to implement before Q4 budget freeze."
        ),
    },
    # ─── VERTEX HEALTH ──────────────────────────────────────────────────────
    {
        "customer_id": "vertex-health",
        "customer_name": "Vertex Health",
        "deal_id": "deal-vertex-001",
        "interaction_type": "Needs Assessment",
        "date": "2026-09-05",
        "content": (
            "Needs assessment with Vertex Health. Attended by CMO Dr. Lisa Park and CIO Tom Bradley. "
            "HIPAA compliance is an absolute requirement — any vendor without full HIPAA BAA will be disqualified. "
            "Dr. Park is focused on clinical AI for diagnostic support. Tom Bradley controls the budget and is more cautious. "
            "They previously evaluated Epic Systems AI tools and found them too rigid. "
            "Tom mentioned Oracle Health as another option they are reviewing. "
            "Key selling point opportunity: our configurable compliance controls were well received by Dr. Park."
        ),
    },
    # ─── ORBIT FINANCIAL ────────────────────────────────────────────────────
    {
        "customer_id": "orbit-financial",
        "customer_name": "Orbit Financial",
        "deal_id": "deal-orbit-001",
        "interaction_type": "Technical Review",
        "date": "2026-09-18",
        "content": (
            "Technical architecture review with Orbit Financial. "
            "Diana Foster (VP Technology) led the technical evaluation. Marcus Chen (Chief Risk Officer) joined mid-call. "
            "Marcus raised significant concerns about audit trail completeness — they need immutable logs for regulatory reporting. "
            "Diana asked detailed questions about data residency (US-only requirement for regulatory reasons). "
            "Current competitor: Bloomberg Terminal AI for analytics workloads. "
            "Diana was impressed by our explainability features. Marcus wants a compliance report template before moving forward."
        ),
    },
    # ─── BLUEPEAK RETAIL ────────────────────────────────────────────────────
    {
        "customer_id": "bluepeak-retail",
        "customer_name": "BluePeak Retail",
        "deal_id": "deal-bluepeak-001",
        "interaction_type": "Discovery Call",
        "date": "2026-09-25",
        "content": (
            "Discovery call with BluePeak Retail CMO Sarah Johnson. "
            "Sarah is highly enthusiastic about AI personalization — she wants it live before Black Friday (Nov 28). "
            "The timeline is extremely tight. She mentioned that Salesforce Commerce Cloud pitched a similar solution. "
            "Cost predictability is critical — they had a bad experience with a previous vendor with usage-based overages. "
            "Sarah requested a fixed-price annual contract. David Lee (CTO) is supportive but cautious about the timeline. "
            "Adobe Experience Cloud was also mentioned as a competitor."
        ),
    },
]


async def seed_via_backend(backend_url: str):
    """Seed memories via the DealMind backend API (which handles Hindsight auth)."""
    print(f"\n🌱 DealMind Demo Seed Script")
    print(f"{'='*60}")
    print(f"Backend URL: {backend_url}")
    print(f"Total interactions to seed: {len(DEMO_MEMORIES)}")
    print(f"{'='*60}\n")

    # Check backend health first
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{backend_url}/api/health")
            health = resp.json()
            print(f"✅ Backend healthy")
            print(f"   Hindsight configured: {health.get('hindsight_configured')}")
            print(f"   Groq configured:      {health.get('groq_configured')}")
            print(f"   Bank ID:              {health.get('bank_id')}")
            print()

            if not health.get("hindsight_configured"):
                print("❌ HINDSIGHT_API_KEY not configured in backend .env")
                print("   Please add your Hindsight API key and restart the backend.")
                return False

        except Exception as exc:
            print(f"❌ Cannot reach backend at {backend_url}: {exc}")
            print("   Please start the backend first: py -m uvicorn backend.main:app --reload")
            return False

    # Seed each memory
    success_count = 0
    fail_count = 0

    async with httpx.AsyncClient(timeout=30.0) as client:
        for i, memory in enumerate(DEMO_MEMORIES, 1):
            customer = memory["customer_name"]
            itype = memory["interaction_type"]
            date = memory["date"]

            print(f"[{i:2d}/{len(DEMO_MEMORIES)}] RETAINING → {customer} | {itype} ({date})")
            print(f"         Content preview: {memory['content'][:80]}...")

            try:
                resp = await client.post(
                    f"{backend_url}/api/memory/retain",
                    json=memory,
                )

                if resp.status_code == 200:
                    result = resp.json()
                    print(f"         ✅ Retained in Hindsight")
                    success_count += 1
                else:
                    error = resp.json().get("detail", resp.text[:100])
                    print(f"         ❌ Failed ({resp.status_code}): {error}")
                    fail_count += 1

            except Exception as exc:
                print(f"         ❌ Error: {exc}")
                fail_count += 1

            print()

    print(f"{'='*60}")
    print(f"🎉 Seed complete!")
    print(f"   ✅ Successfully retained: {success_count}")
    print(f"   ❌ Failed:               {fail_count}")
    print()
    print("📋 Next steps:")
    print("   1. Open the DealMind frontend: http://localhost:5173")
    print("   2. Select 'Acme Corporation' from the Customers list")
    print("   3. Click 'Prepare Me for This Call'")
    print("   4. Watch Hindsight RECALL retrieve the seeded memories!")
    print(f"{'='*60}\n")
    return success_count > 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed DealMind demo memories into Hindsight")
    parser.add_argument("--backend", default=BACKEND_URL, help="Backend URL")
    args = parser.parse_args()

    success = asyncio.run(seed_via_backend(args.backend))
    sys.exit(0 if success else 1)
