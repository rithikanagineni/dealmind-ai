import React, { useEffect, useState } from 'react';
import {
  api, formatCurrency, stageColor, probabilityColor, timeAgo, renderBriefingMarkdown,
  type Customer, type Deal, type MemoryItem, type MemoryActivityItem
} from '../api';
import {
  ChevronLeft, Phone, Brain, Shield, Users, Building2, AlertTriangle,
  CheckCircle, Clock, RefreshCw, Loader2, Sparkles, ChevronDown, ChevronRight, Star
} from 'lucide-react';

interface CustomerViewProps {
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
}

export default function CustomerView({ selectedCustomerId, onSelectCustomer }: CustomerViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [memoriesRecalled, setMemoriesRecalled] = useState<MemoryItem[]>([]);
  const [activity, setActivity] = useState<MemoryActivityItem[]>([]);
  const [showBriefing, setShowBriefing] = useState(false);

  // Load customer list
  useEffect(() => {
    api.customers.list().then(({ customers }) => setCustomers(customers));
  }, []);

  // Load selected customer detail
  useEffect(() => {
    if (!selectedCustomerId) return;
    setLoading(true);
    setBriefing(null);
    setMemoriesRecalled([]);
    api.customers.get(selectedCustomerId)
      .then(({ customer, deals }) => {
        setSelectedCustomer(customer);
        setDeals(deals);
        setSelectedDeal(deals[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load memory activity
    api.memory.activity(selectedCustomerId)
      .then(({ activity }) => setActivity(activity))
      .catch(() => setActivity([]));
  }, [selectedCustomerId]);

  const handlePrepareCall = async () => {
    if (!selectedCustomer) return;
    setPreparing(true);
    setBriefing(null);
    setShowBriefing(false);

    try {
      const result = await api.agent.prepareCall({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        deal_id: selectedDeal?.id,
        deal_name: selectedDeal?.name,
        deal_stage: selectedDeal?.stage,
        deal_value: selectedDeal?.value,
      });
      setBriefing(result.briefing);
      setMemoriesRecalled(result.memories_recalled);
      setShowBriefing(true);

      // Refresh activity log
      const act = await api.memory.activity(selectedCustomer.id);
      setActivity(act.activity);
    } catch (err: unknown) {
      setBriefing(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setShowBriefing(true);
    } finally {
      setPreparing(false);
    }
  };

  // List view
  if (!selectedCustomerId || !selectedCustomer) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Select a customer to view their deal intelligence.</p>
        </div>
        {loading && <div className="text-slate-500 text-sm">Loading...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.industry}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 mb-3">{c.company_size}</div>
              <div className="flex flex-wrap gap-1.5">
                {c.concerns.slice(0, 2).map((concern) => (
                  <span key={concern} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500 text-sm">Loading customer data...</div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => onSelectCustomer('')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{selectedCustomer.industry}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{selectedCustomer.company_size}</span>
                  </div>
                </div>
              </div>
              {/* PREPARE CALL BUTTON — Core Feature */}
              <button
                onClick={handlePrepareCall}
                disabled={preparing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                {preparing ? (
                  <><Loader2 size={15} className="animate-spin" /> Preparing...</>
                ) : (
                  <><Phone size={15} /> Prepare Me for This Call</>
                )}
              </button>
            </div>

            {/* Deal Info */}
            {selectedDeal && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Deal</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor(selectedDeal.stage)}`}>
                    {selectedDeal.stage}
                  </span>
                </div>
                <div className="font-semibold text-slate-900">{selectedDeal.name}</div>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <div className="text-xs text-slate-500">Value</div>
                    <div className="font-bold text-slate-900">{formatCurrency(selectedDeal.value)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Probability</div>
                    <div className={`font-bold ${probabilityColor(selectedDeal.probability)}`}>{selectedDeal.probability}%</div>
                  </div>
                  {selectedDeal.close_date && (
                    <div>
                      <div className="text-xs text-slate-500">Close Date</div>
                      <div className="font-medium text-slate-900 text-sm">{selectedDeal.close_date}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Briefing Panel */}
          {briefing && (
            <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="px-5 py-4 bg-blue-50 rounded-t-xl border-b border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">Call Preparation Briefing</span>
                  {memoriesRecalled.length > 0 && (
                    <span className="memory-badge-recall ml-2">
                      {memoriesRecalled.length} Memories Recalled
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowBriefing(!showBriefing)}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  {showBriefing ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              {showBriefing && (
                <div
                  className="px-6 py-4 briefing-content overflow-y-auto max-h-[600px] scrollbar-thin"
                  dangerouslySetInnerHTML={{ __html: renderBriefingMarkdown(briefing) }}
                />
              )}
            </div>
          )}

          {/* Known Concerns */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Known Concerns</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {selectedCustomer.concerns.map((c) => (
                <span key={c} className="text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                  ⚠️ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Clock size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Recent Interactions</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {selectedCustomer.recent_interactions.map((int) => (
                <div key={int.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{int.type}</span>
                      <span className="text-xs text-slate-400">{timeAgo(int.date)}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      int.outcome.toLowerCase().includes('positive') ? 'bg-green-50 text-green-700' :
                      int.outcome.toLowerCase().includes('mixed') ? 'bg-yellow-50 text-yellow-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {int.outcome}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1.5">{int.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Stakeholders */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Stakeholders</h2>
            </div>
            <div className="p-4 space-y-3">
              {selectedCustomer.stakeholders.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{s.name}</div>
                    <div className="text-xs text-slate-500 truncate">{s.title}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                    s.influence === 'high' ? 'bg-red-50 text-red-600' :
                    s.influence === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {s.influence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Shield size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Competitors</h2>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {selectedCustomer.competitors.map((c) => (
                <span key={c} className="text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 font-medium">
                  vs {c}
                </span>
              ))}
            </div>
          </div>

          {/* Memory Insights — powered by Hindsight */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={15} className="text-blue-600" />
                <h2 className="font-semibold text-slate-900 text-sm">Memory Insights</h2>
              </div>
              <span className="memory-badge-recall">Hindsight</span>
            </div>
            <div className="p-4">
              {memoriesRecalled.length > 0 ? (
                <div className="space-y-2">
                  {memoriesRecalled.slice(0, 5).map((m, i) => (
                    <div key={i} className="text-xs text-slate-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle size={11} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>{m.content.slice(0, 140)}{m.content.length > 140 ? '...' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-4">
                  <Brain size={24} className="text-slate-200 mx-auto mb-2" />
                  Click "Prepare Me for This Call" to recall memories from Hindsight.
                </div>
              )}
            </div>
          </div>

          {/* Memory Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-slate-400" />
                <h2 className="font-semibold text-slate-900 text-sm">Memory Activity</h2>
              </div>
              <span className="text-xs text-slate-400">{activity.length} ops</span>
            </div>
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {activity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No memory activity yet this session.</p>
              ) : (
                activity.slice().reverse().map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={a.operation === 'retained' ? 'memory-badge-retain' : 'memory-badge-recall'}>
                      {a.operation}
                    </span>
                    <span className="text-slate-600 flex-1 leading-relaxed">{a.content.slice(0, 100)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
