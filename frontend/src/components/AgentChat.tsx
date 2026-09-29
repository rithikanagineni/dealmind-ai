import React, { useState, useRef, useEffect } from 'react';
import { api, type MemoryItem } from '../api';
import { MessageSquare, Send, Loader2, Brain, User, Bot, X } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  memories_used?: MemoryItem[];
  memory_count?: number;
  timestamp: Date;
};

const DEMO_CUSTOMERS = [
  { id: '', name: 'No specific customer (general)' },
  { id: 'acme-corp', name: 'Acme Corporation' },
  { id: 'novatech', name: 'NovaTech Systems' },
  { id: 'vertex-health', name: 'Vertex Health' },
  { id: 'orbit-financial', name: 'Orbit Financial' },
  { id: 'bluepeak-retail', name: 'BluePeak Retail' },
];

const QUICK_QUESTIONS = [
  "What objections has this customer raised?",
  "Who are the key stakeholders I should focus on?",
  "What competitors are in play?",
  "What approaches worked well with this customer before?",
  "What should I absolutely avoid saying?",
  "Prepare me for my next call.",
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm DealMind, your AI sales intelligence assistant. I can recall memories of your customer interactions from Hindsight to help you prepare for calls. Select a customer above and ask me anything.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(DEMO_CUSTOMERS[1]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await api.agent.chat({
        message: content,
        customer_id: selectedCustomer.id || undefined,
        customer_name: selectedCustomer.id ? selectedCustomer.name : undefined,
        conversation_history: messages
          .filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0)
          .map((m) => ({ role: m.role, content: m.content })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          memories_used: result.memories_used,
          memory_count: result.memory_count,
          timestamp: new Date(),
        }
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Ask DealMind</h1>
            <p className="text-xs text-slate-500">Memory-augmented sales intelligence</p>
          </div>
        </div>

        {/* Customer Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">Context:</label>
          <select
            value={selectedCustomer.id}
            onChange={(e) => {
              const c = DEMO_CUSTOMERS.find((d) => d.id === e.target.value)!;
              setSelectedCustomer(c);
            }}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DEMO_CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setMessages([{
              role: 'assistant',
              content: "Conversation cleared. Ask me anything about your customers.",
              timestamp: new Date(),
            }])}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear conversation"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex gap-2 overflow-x-auto shrink-0">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-xs bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                : 'bg-blue-100'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-blue-600" />}
            </div>

            <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {/* Memory indicator */}
              {msg.role === 'assistant' && msg.memory_count !== undefined && msg.memory_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                  <Brain size={11} />
                  <span className="font-medium">{msg.memory_count} memories used from Hindsight</span>
                </div>
              )}

              {/* Message bubble */}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>

              <span className="text-xs text-slate-400">
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={14} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Loader2 size={13} className="animate-spin" />
                <span>Recalling memories from Hindsight...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Ask about ${selectedCustomer.name || 'your customers'}...`}
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          DealMind recalls memories from Hindsight to ground every response in real interaction history.
        </p>
      </div>
    </div>
  );
}
