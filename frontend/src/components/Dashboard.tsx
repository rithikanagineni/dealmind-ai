import React, { useEffect, useState } from 'react';
import { api, formatCurrency, stageColor, probabilityColor, type Customer, type Deal } from '../api';
import { TrendingUp, AlertTriangle, Users, DollarSign, Target, Calendar, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onSelectCustomer: (id: string) => void;
}

export default function Dashboard({ onSelectCustomer }: DashboardProps) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(({ stats, recent_deals, customers }) => {
        setStats(stats);
        setDeals(recent_deals);
        setCustomers(customers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sales Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Memory-powered deal intelligence. Every interaction remembered.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Briefcase size={18} className="text-blue-600" />}
            label="Active Deals"
            value={String(stats.total_active_deals)}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<DollarSign size={18} className="text-green-600" />}
            label="Pipeline Value"
            value={formatCurrency(stats.total_pipeline_value)}
            bg="bg-green-50"
          />
          <StatCard
            icon={<AlertTriangle size={18} className="text-red-500" />}
            label="High Risk Deals"
            value={String(stats.high_risk_deals)}
            bg="bg-red-50"
            alert
          />
          <StatCard
            icon={<Users size={18} className="text-purple-600" />}
            label="Customers"
            value={String(stats.customers)}
            bg="bg-purple-50"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Deal Pipeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active opportunities</p>
            </div>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectCustomer(deal.customer_id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="font-medium text-slate-900 text-sm">{deal.name}</span>
                    <span className="text-slate-400 text-xs ml-2">{deal.customer_name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">{formatCurrency(deal.value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                    {deal.close_date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {deal.close_date}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${probabilityColor(deal.probability)}`}>
                      {deal.probability}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Customers</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click to view deal intelligence</p>
          </div>
          <div className="divide-y divide-slate-50">
            {customers.map((c) => (
              <div
                key={c.id}
                className="px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                onClick={() => onSelectCustomer(c.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.industry}</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Status Banner */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Target size={16} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">Hindsight Memory Active</div>
            <div className="text-xs text-slate-600 mt-0.5">
              DealMind remembers every customer interaction. Select a customer → click "Prepare Me for This Call" to see memory in action.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, alert }: { icon: React.ReactNode; label: string; value: string; bg: string; alert?: boolean }) {
  return (
    <div className={`${bg} rounded-xl p-4 border ${alert ? 'border-red-100' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <div className={`text-xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

// Missing import fix
function Briefcase(props: { size: number; className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <rect width="20" height="14" x="2" y="7" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
