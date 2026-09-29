"""
Deal Service — In-memory demo data for DealMind.
In production this would connect to a CRM (Salesforce, HubSpot, etc.).
"""
from backend.models.schemas import Customer, Deal, Stakeholder, Interaction
from typing import Optional

# ─── Demo Customer Dataset ──────────────────────────────────────────────────────

CUSTOMERS: dict[str, Customer] = {
    "acme-corp": Customer(
        id="acme-corp",
        name="Acme Corporation",
        industry="Manufacturing",
        company_size="Enterprise (5,000+ employees)",
        website="https://acmecorp.example.com",
        stakeholders=[
            Stakeholder(name="Priya Sharma", title="CTO", email="priya@acme.example", influence="high"),
            Stakeholder(name="James Mitchell", title="VP of Operations", email="jmitchell@acme.example", influence="high"),
            Stakeholder(name="Rachel Torres", title="Procurement Manager", email="rtorres@acme.example", influence="medium"),
        ],
        concerns=["Enterprise pricing", "Implementation timeline", "Data security & SOC 2 compliance"],
        competitors=["Salesforce", "SAP"],
        recent_interactions=[
            Interaction(
                id="int-001",
                date="2026-09-15",
                type="Discovery Call",
                summary="Introduced AI platform capabilities. Priya Sharma expressed interest but flagged data security requirements.",
                outcome="Positive — scheduled follow-up",
            ),
            Interaction(
                id="int-002",
                date="2026-09-22",
                type="Demo",
                summary="Delivered full product demo. Team liked the implementation timeline story. Pricing still a concern.",
                outcome="Mixed — pricing objection raised",
            ),
        ],
    ),
    "novatech": Customer(
        id="novatech",
        name="NovaTech Systems",
        industry="Technology",
        company_size="Mid-Market (500-2,000 employees)",
        website="https://novatech.example.com",
        stakeholders=[
            Stakeholder(name="Alex Reyes", title="CEO", email="areyes@novatech.example", influence="high"),
            Stakeholder(name="Sandra Kim", title="Head of IT", email="skim@novatech.example", influence="medium"),
        ],
        concerns=["Integration complexity", "ROI timeline", "Vendor lock-in"],
        competitors=["Microsoft Azure AI", "Google Cloud AI"],
        recent_interactions=[
            Interaction(
                id="int-003",
                date="2026-09-10",
                type="Intro Call",
                summary="Alex Reyes very interested in automation capabilities. Concerned about integration with existing stack.",
                outcome="Positive — demo scheduled",
            ),
        ],
    ),
    "vertex-health": Customer(
        id="vertex-health",
        name="Vertex Health",
        industry="Healthcare",
        company_size="Enterprise (2,000-5,000 employees)",
        website="https://vertexhealth.example.com",
        stakeholders=[
            Stakeholder(name="Dr. Lisa Park", title="Chief Medical Officer", email="lpark@vertexhealth.example", influence="high"),
            Stakeholder(name="Tom Bradley", title="CIO", email="tbradley@vertexhealth.example", influence="high"),
        ],
        concerns=["HIPAA compliance", "Data privacy", "Clinical workflow disruption"],
        competitors=["Epic Systems", "Oracle Health"],
        recent_interactions=[
            Interaction(
                id="int-004",
                date="2026-09-05",
                type="Needs Assessment",
                summary="Focused discussion on clinical AI use cases. HIPAA compliance is non-negotiable. Tom Bradley controls the budget.",
                outcome="Strong interest — security review requested",
            ),
        ],
    ),
    "orbit-financial": Customer(
        id="orbit-financial",
        name="Orbit Financial",
        industry="Financial Services",
        company_size="Enterprise (1,000+ employees)",
        website="https://orbitfinancial.example.com",
        stakeholders=[
            Stakeholder(name="Marcus Chen", title="Chief Risk Officer", email="mchen@orbit.example", influence="high"),
            Stakeholder(name="Diana Foster", title="VP Technology", email="dfoster@orbit.example", influence="high"),
        ],
        concerns=["Regulatory compliance", "Data sovereignty", "Audit trails"],
        competitors=["Bloomberg Terminal AI", "Refinitiv"],
        recent_interactions=[
            Interaction(
                id="int-005",
                date="2026-09-18",
                type="Technical Review",
                summary="Diana Foster led deep-dive on architecture. Marcus Chen raised concerns about audit trail capabilities.",
                outcome="Technical evaluation ongoing",
            ),
        ],
    ),
    "bluepeak-retail": Customer(
        id="bluepeak-retail",
        name="BluePeak Retail",
        industry="Retail & E-Commerce",
        company_size="Mid-Market (200-1,000 employees)",
        website="https://bluepeak.example.com",
        stakeholders=[
            Stakeholder(name="Sarah Johnson", title="CMO", email="sjohnson@bluepeak.example", influence="high"),
            Stakeholder(name="David Lee", title="CTO", email="dlee@bluepeak.example", influence="medium"),
        ],
        concerns=["Seasonal scalability", "Cost predictability", "Personalization capabilities"],
        competitors=["Salesforce Commerce Cloud", "Adobe Experience Cloud"],
        recent_interactions=[
            Interaction(
                id="int-006",
                date="2026-09-25",
                type="Discovery Call",
                summary="Sarah Johnson excited about AI personalization for Black Friday. Cost predictability is key concern.",
                outcome="Positive — proposal requested",
            ),
        ],
    ),
}

DEALS: dict[str, Deal] = {
    "deal-acme-001": Deal(
        id="deal-acme-001",
        customer_id="acme-corp",
        customer_name="Acme Corporation",
        name="Enterprise AI Platform",
        stage="Negotiation",
        value=120000,
        probability=65,
        close_date="2026-10-31",
        description="Full enterprise AI platform deployment with custom integrations.",
    ),
    "deal-novatech-001": Deal(
        id="deal-novatech-001",
        customer_id="novatech",
        customer_name="NovaTech Systems",
        name="AI Operations Suite",
        stage="Demo",
        value=75000,
        probability=45,
        close_date="2026-11-15",
        description="AI-powered operations automation for their engineering workflows.",
    ),
    "deal-vertex-001": Deal(
        id="deal-vertex-001",
        customer_id="vertex-health",
        customer_name="Vertex Health",
        name="Clinical AI Assistant",
        stage="Security Review",
        value=200000,
        probability=40,
        close_date="2026-12-01",
        description="HIPAA-compliant clinical AI assistant for medical staff.",
    ),
    "deal-orbit-001": Deal(
        id="deal-orbit-001",
        customer_id="orbit-financial",
        customer_name="Orbit Financial",
        name="Risk Analytics AI",
        stage="Technical Evaluation",
        value=150000,
        probability=55,
        close_date="2026-11-30",
        description="AI-driven risk analytics platform with regulatory compliance built-in.",
    ),
    "deal-bluepeak-001": Deal(
        id="deal-bluepeak-001",
        customer_id="bluepeak-retail",
        customer_name="BluePeak Retail",
        name="Personalization Engine",
        stage="Proposal",
        value=60000,
        probability=70,
        close_date="2026-10-15",
        description="AI personalization engine for e-commerce and marketing.",
    ),
}


def get_all_customers() -> list[Customer]:
    return list(CUSTOMERS.values())


def get_customer(customer_id: str) -> Optional[Customer]:
    return CUSTOMERS.get(customer_id)


def get_all_deals() -> list[Deal]:
    return list(DEALS.values())


def get_deal(deal_id: str) -> Optional[Deal]:
    return DEALS.get(deal_id)


def get_deals_for_customer(customer_id: str) -> list[Deal]:
    return [d for d in DEALS.values() if d.customer_id == customer_id]


def get_dashboard_stats() -> dict:
    deals = list(DEALS.values())
    high_value_threshold = 100000
    return {
        "total_active_deals": len(deals),
        "total_pipeline_value": sum(d.value for d in deals),
        "high_risk_deals": sum(1 for d in deals if d.probability < 50),
        "deals_closing_soon": sum(1 for d in deals if d.probability >= 65),
        "customers": len(CUSTOMERS),
        "average_deal_value": sum(d.value for d in deals) / len(deals) if deals else 0,
    }
