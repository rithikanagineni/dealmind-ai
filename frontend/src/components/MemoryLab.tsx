import React, { useState } from 'react';
import { api, type MemoryItem, type MemoryActivityItem } from '../api';
import {
  FlaskConical, Brain, CheckCircle, ArrowDown, Loader2, Plus,
  Sparkles, AlertCircle, Database, Search
} from 'lucide-react';

type MemLabStep = {
  type: 'retain' | 'recall' | 'response';
  label: string;
  content: string;
  status: 'pending' | 'done' | 'error';
  memories?: MemoryItem[];
};

const DEMO_CUSTOMERS = [
  { id: 'acme-corp', name: 'Acme Corporation' },
  { id: 'novatech', name: 'NovaTech Systems' },
  { id: 'vertex-health', name: 'Vertex Health' },
  { id: 'orbit-financial', name: 'Orbit Financial' },
  { id: 'bluepeak-retail', name: 'BluePeak Retail' },
];

const PRESET_INTERACTIONS = [
  {
    label: 'Pricing Concern',
    content: 'Acme is evaluating multiple vendors and is seriously concerned about enterprise pricing — they believe our quote is 25% above their approved budget.',
    type: 'Discovery Call'
  },
  {
    label: 'CTO Security Request',
    content: "CTO Priya Sharma specifically requested SOC 2 Type II documentation and a security architecture review. She stated data security is non-negotiable for Acme.",
    type: 'Follow-up'
  },
  {
    label: 'Salesforce Comparison',
    content: "During the demo, Acme compared our enterprise pricing directly with Salesforce. They said Salesforce is their primary alternative and our pricing is higher.",
    type: 'Product Demo'
  },
  {
    label: 'Positive: Implementation Timeline',
    content: "Acme responded very positively when we walked through our 8-week implementation timeline. James Mitchell said this is much better than Salesforce's 6-month deployment.",
    type: 'Product Demo'
  },
];

export default function MemoryLab() {
  const [selectedCustomer, setSelectedCustomer] = useState(DEMO_CUSTOMERS[0]);
  const [customContent, setCustomContent] = useState('');
  const [interactionType, setInteractionType] = useState('Customer Call');
  const [steps, setSteps] = useState<MemLabStep[]>([]);
  const [retaining, setRetaining] = useState(false);
  const [recalling, setRecalling] = useState(false);
  const [recallQuery, setRecallQuery] = useState('');
  const [activity, setActivity] = useState<MemoryActivityItem[]>([]);

  const refreshActivity = async () => {
    try {
      const { activity } = await api.memory.activity(selectedCustomer.id);
      setActivity(activity);
    } catch { /* non-fatal */ }
  };

  const handleRetain = async (content?: string, type?: string) => {
    const retainContent = content || customContent;
    if (!retainContent.trim()) return;
    setRetaining(true);

    const step: MemLabStep = {
      type: 'retain',
      label: `RETAIN — ${type || interactionType}`,
      content: retainContent,
      status: 'pending',
    };
    setSteps((prev) => [...prev, step]);

    try {
      await api.memory.retain({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        interaction_type: type || interactionType,
        content: retainContent,
      });
      setSteps((prev) =>
        prev.map((s, i) => i === prev.length - 1 ? { ...s, status: 'done' } : s)
      );
      if (!content) setCustomContent('');
      await refreshActivity();
    } catch (err: unknown) {
      setSteps((prev) =>
        prev.map((s, i) => i === prev.length - 1
          ? { ...s, status: 'error', content: `Error: ${err instanceof Error ? err.message : String(err)}` }
          : s
        )
      );
    } finally {
      setRetaining(false);
    }
  };

  const handleRecall = async () => {
    const query = recallQuery || `What are the key concerns, objections, and history for ${selectedCustomer.name}?`;
    setRecalling(true);

    const recallStep: MemLabStep = {
      type: 'recall',
      label: `RECALL — "${query.slice(0, 60)}${query.length > 60 ? '...' : ''}"`,
      content: 'Querying Hindsight memory...',
      status: 'pending',
    };
    setSteps((prev) => [...prev, recallStep]);

    try {
      const result = await api.memory.recall({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        query,
      });

      const memoriesText = result.memories.length > 0
        ? result.memories.map((m) => `• ${m.content}`).join('\n')
        : 'No memories found.';

      setSteps((prev) =>
        prev.map((s, i) =>
          i === prev.length - 1
            ? { ...s, status: 'done', content: `${result.count} memories recalled:\n\n${memoriesText}`, memories: result.memories }
            : s
        )
      );

      if (result.memories.length > 0) {
        // Add agent response step
        setRecalling(true);
        const responseStep: MemLabStep = {
          type: 'response',
          label: 'PERSONALIZED RESPONSE — powered by Hindsight + Groq',
          content: 'Generating memory-powered briefing...',
          status: 'pending',
          memories: result.memories,
        };
        setSteps((prev) => [...prev, responseStep]);

        const chat = await api.agent.prepareCall({
          customer_id: selectedCustomer.id,
          customer_name: selectedCustomer.name,
        });

        setSteps((prev) =>
          prev.map((s, i) =>
            i === prev.length - 1
              ? { ...s, status: 'done', content: chat.briefing }
              : s
          )
        );
      }

      await refreshActivity();
    } catch (err: unknown) {
      setSteps((prev) =>
        prev.map((s, i) => i === prev.length - 1
          ? { ...s, status: 'error', content: `Error: ${err instanceof Error ? err.message : String(err)}` }
          : s
        )
      );
    } finally {
      setRecalling(false);
    }
  };

  const handlePreset = (interaction: typeof PRESET_INTERACTIONS[0]) => {
    handleRetain(interaction.content, interaction.type);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <FlaskConical size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Memory Lab</h1>
            <p className="text-slate-500 text-sm">Demonstrate Hindsight RETAIN → RECALL → PERSONALIZED RESPONSE</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-800 mt-3">
          <strong>How it works:</strong> Add customer interactions (RETAIN) → Ask questions (RECALL) → See how DealMind's responses change based on what Hindsight remembers.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Customer Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Customer</label>
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const c = DEMO_CUSTOMERS.find((d) => d.id === e.target.value)!;
                setSelectedCustomer(c);
                setSteps([]);
                setActivity([]);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEMO_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Preset Interactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database size={14} className="text-green-600" />
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Quick Retain (Demo Data)</label>
            </div>
            <div className="space-y-2">
              {PRESET_INTERACTIONS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(p)}
                  disabled={retaining}
                  className="w-full text-left px-3 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs text-green-800 font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Plus size={11} />
                    <span className="font-semibold">{p.label}</span>
                  </div>
                  <div className="text-green-700 font-normal leading-relaxed">{p.content.slice(0, 80)}...</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Retain */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-blue-600" />
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Custom Retain</label>
            </div>
            <select
              value={interactionType}
              onChange={(e) => setInteractionType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['Customer Call', 'Product Demo', 'Follow-up Email', 'Negotiation', 'Technical Review', 'Discovery Call'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder={`Enter interaction details for ${selectedCustomer.name}...`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
            <button
              onClick={() => handleRetain()}
              disabled={retaining || !customContent.trim()}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer"
            >
              {retaining ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {retaining ? 'Retaining...' : 'RETAIN Memory'}
            </button>
          </div>

          {/* Recall */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search size={14} className="text-blue-600" />
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Recall Query</label>
            </div>
            <input
              type="text"
              value={recallQuery}
              onChange={(e) => setRecallQuery(e.target.value)}
              placeholder="What should I know before my next call?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button
              onClick={handleRecall}
              disabled={recalling || retaining}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer"
            >
              {recalling ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {recalling ? 'Recalling...' : 'RECALL + Generate Briefing'}
            </button>
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clear button */}
          {steps.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => { setSteps([]); setActivity([]); }}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Clear Timeline
              </button>
            </div>
          )}

          {steps.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <FlaskConical size={40} className="text-slate-200 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-700 mb-1">Memory Lab Ready</h3>
              <p className="text-slate-500 text-sm">
                1. Add interactions using "Quick Retain" presets<br />
                2. Click "RECALL + Generate Briefing"<br />
                3. Watch how memory transforms the response
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${
                    step.type === 'retain' ? 'border-green-200' :
                    step.type === 'recall' ? 'border-blue-200' :
                    'border-purple-200'
                  }`}>
                    {/* Step Header */}
                    <div className={`px-4 py-3 flex items-center gap-3 ${
                      step.type === 'retain' ? 'bg-green-50' :
                      step.type === 'recall' ? 'bg-blue-50' :
                      'bg-purple-50'
                    }`}>
                      {step.status === 'pending' ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : step.status === 'error' ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <CheckCircle size={16} className={
                          step.type === 'retain' ? 'text-green-600' :
                          step.type === 'recall' ? 'text-blue-600' :
                          'text-purple-600'
                        } />
                      )}
                      <span className={`memory-badge-${step.type === 'retain' ? 'retain' : step.type === 'recall' ? 'recall' : 'reflect'}`}>
                        {step.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{step.label}</span>
                    </div>
                    {/* Step Content */}
                    <div className="px-4 py-3">
                      {step.memories && step.memories.length > 0 && (
                        <div className="mb-3 text-xs text-blue-700 bg-blue-50 rounded-lg p-2 border border-blue-100">
                          ✓ {step.memories.length} memories retrieved from Hindsight
                        </div>
                      )}
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans max-h-64 overflow-y-auto scrollbar-thin">
                        {step.content}
                      </pre>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowDown size={20} className="text-slate-300" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Memory Activity Panel */}
          {activity.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-blue-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Memory Activity Panel</h3>
                </div>
                <span className="text-xs text-slate-400">Live Hindsight Operations</span>
              </div>
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {activity.slice().reverse().map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs border-b border-slate-50 pb-2">
                    <span className={a.operation === 'retained' ? 'memory-badge-retain' : 'memory-badge-recall'}>
                      {a.operation}
                    </span>
                    <span className="text-slate-600 flex-1 leading-relaxed">{a.content}</span>
                    <span className="text-slate-400 shrink-0">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
