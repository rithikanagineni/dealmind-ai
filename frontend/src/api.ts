// API client for DealMind backend

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Stakeholder {
  name: string;
  title: string;
  email?: string;
  influence: 'high' | 'medium' | 'low';
}

export interface Interaction {
  id: string;
  date: string;
  type: string;
  summary: string;
  outcome: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  company_size: string;
  website?: string;
  stakeholders: Stakeholder[];
  concerns: string[];
  competitors: string[];
  recent_interactions: Interaction[];
}

export interface Deal {
  id: string;
  customer_id: string;
  customer_name: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  close_date?: string;
  description?: string;
}

export interface MemoryItem {
  content: string;
  score?: number;
  timestamp?: string;
}

export interface MemoryActivityItem {
  operation: string;
  content: string;
  timestamp: string;
}

export interface AgentResponse {
  response: string;
  memories_used: MemoryItem[];
  memory_count: number;
}

export interface PrepareCallResponse {
  status: string;
  customer_name: string;
  deal_info: Record<string, unknown>;
  memories_recalled: MemoryItem[];
  memory_count: number;
  briefing: string;
  memory_powered: boolean;
}

// ─── API Methods ───────────────────────────────────────────────────────────────

export const api = {
  health: () => request<{ status: string; hindsight_configured: boolean; groq_configured: boolean; bank_id: string }>('/health'),

  dashboard: () => request<{ stats: Record<string, number>; recent_deals: Deal[]; customers: Customer[] }>('/dashboard'),

  customers: {
    list: () => request<{ customers: Customer[] }>('/customers'),
    get: (id: string) => request<{ customer: Customer; deals: Deal[] }>(`/customers/${id}`),
  },

  deals: {
    list: () => request<{ deals: Deal[] }>('/deals'),
    get: (id: string) => request<{ deal: Deal }>(`/deals/${id}`),
  },

  memory: {
    retain: (data: {
      customer_id: string;
      customer_name: string;
      deal_id?: string;
      interaction_type: string;
      content: string;
      date?: string;
    }) =>
      request<{ status: string; message: string; operation: string }>('/memory/retain', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    recall: (data: {
      customer_id: string;
      customer_name: string;
      query: string;
      top_k?: number;
    }) =>
      request<{ status: string; memories: MemoryItem[]; count: number; operation: string }>('/memory/recall', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    activity: (customerId: string) =>
      request<{ customer_id: string; activity: MemoryActivityItem[]; count: number }>(
        `/memory/activity/${customerId}`
      ),
  },

  agent: {
    prepareCall: (data: {
      customer_id: string;
      customer_name: string;
      deal_id?: string;
      deal_name?: string;
      deal_stage?: string;
      deal_value?: number;
    }) =>
      request<PrepareCallResponse>('/agent/prepare-call', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    chat: (data: {
      message: string;
      customer_id?: string;
      customer_name?: string;
      deal_id?: string;
      conversation_history?: Array<{ role: string; content: string }>;
    }) =>
      request<AgentResponse>('/agent/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function stageColor(stage: string): string {
  const map: Record<string, string> = {
    'Discovery': 'bg-blue-100 text-blue-700',
    'Demo': 'bg-purple-100 text-purple-700',
    'Proposal': 'bg-yellow-100 text-yellow-700',
    'Negotiation': 'bg-orange-100 text-orange-700',
    'Security Review': 'bg-red-100 text-red-700',
    'Technical Evaluation': 'bg-indigo-100 text-indigo-700',
    'Closed Won': 'bg-green-100 text-green-700',
    'Closed Lost': 'bg-gray-100 text-gray-700',
  };
  return map[stage] || 'bg-gray-100 text-gray-700';
}

export function probabilityColor(prob: number): string {
  if (prob >= 70) return 'text-green-600';
  if (prob >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

// Simple markdown renderer for briefing content
export function renderBriefingMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>');
}
