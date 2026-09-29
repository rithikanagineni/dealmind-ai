import React, { useEffect, useState, useMemo } from 'react';
import { api, formatCurrency, stageColor, probabilityColor, type Deal } from '../api';
import { Briefcase, Search, X, TrendingUp, Calendar, ChevronRight, Loader2, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface DealsPageProps {
  onSelectCustomer: (id: string) => void;
}

const STAGES = ['All', 'Discovery', 'Demo', 'Proposal', 'Negotiation', 'Security Review', 'Technical Evaluation', 'Closed Won', 'Closed Lost'];

export default function DealsPage({ onSelectCustomer }: DealsPageProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'close_date'>('value');

  useEffect(() => {
    api.deals.list()
      .then(({ deals }) => setDeals(deals))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...deals];
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.customer_name.toLowerCase().includes(q) ||
        d.stage.toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'All') {
      result = result.filter(d => d.stage === stageFilter);
    }
    result.sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'probability') return b.probability - a.probability;
      if (sortBy === 'close_date') return (a.close_date || '').localeCompare(b.close_date || '');
      return 0;
    });
    return result;
  }, [deals, search, stageFilter, sortBy]);

  const totalPipeline = filtered.reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = filtered.reduce((sum, d) => sum + d.value * d.probability / 100, 0);
  const avgProbability = filtered.length ? Math.round(filtered.reduce((s, d) => s + d.probability, 0) / filtered.length) : 0;
  const atRisk = filtered.filter(d => d.probability < 50).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
          <p className="text-slate-500 text-sm mt-1">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} in pipeline
            {search || stageFilter !== 'All' ? ` · ${filtered.length} showing` : ''}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<DollarSign size={16} className="text-blue-600" />}
          label="Total Pipeline"
          value={formatCurrency(totalPipeline)}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-green-600" />}
          label="Weighted Pipeline"
          value={formatCurrency(weightedPipeline)}
          bg="bg-green-50"
        />
        <StatCard
          icon={<CheckCircle size={16} className="text-purple-600" />}
          label="Avg Probability"
          value={`${avgProbability}%`}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<AlertTriangle size={16} className="text-red-500" />}
          label="At Risk"
          value={String(atRisk)}
          bg="bg-red-50"
          alert={atRisk > 0}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by name, customer, stage..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="value">Sort: Value ↓</option>
          <option value="probability">Sort: Probability ↓</option>
          <option value="close_date">Sort: Close Date ↑</option>
        </select>
      </div>

      {/* Deals Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Briefcase size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No deals found</p>
          {(search || stageFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setStageFilter('All'); }}
              className="mt-2 text-blue-600 text-sm hover:underline cursor-pointer">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-4">Deal / Customer</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-2">Probability</div>
            <div className="col-span-1">Close</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-50">
            {filtered.map((deal) => (
              <div
                key={deal.id}
                onClick={() => onSelectCustomer(deal.customer_id)}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                {/* Deal name + customer */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {deal.customer_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">{deal.name}</div>
                      <div className="text-xs text-slate-500 truncate">{deal.customer_name}</div>
                    </div>
                  </div>
                </div>

                {/* Stage badge */}
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${stageColor(deal.stage)}`}>
                    {deal.stage}
                  </span>
                </div>

                {/* Value */}
                <div className="col-span-2 text-right">
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(deal.value)}</span>
                </div>

                {/* Probability bar */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold shrink-0 ${probabilityColor(deal.probability)}`}>
                      {deal.probability}%
                    </span>
                  </div>
                </div>

                {/* Close date */}
                <div className="col-span-1">
                  {deal.close_date ? (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={11} />
                      {deal.close_date.slice(5)}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>

                {/* Arrow */}
                <div className="col-span-1 flex justify-end">
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</span>
            <span>Total pipeline: <span className="font-semibold text-slate-700">{formatCurrency(totalPipeline)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg, alert }: { icon: React.ReactNode; label: string; value: string; bg: string; alert?: boolean }) {
  return (
    <div className={`${bg} rounded-xl p-4 border ${alert ? 'border-red-100' : 'border-slate-100'}`}>
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm mb-2">
        {icon}
      </div>
      <div className={`text-xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
