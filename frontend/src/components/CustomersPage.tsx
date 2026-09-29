import React, { useEffect, useState, useMemo } from 'react';
import { api, type Customer } from '../api';
import { Search, UserPlus, Building2, ChevronRight, Users, X, Loader2 } from 'lucide-react';

interface CustomersPageProps {
  onSelectCustomer: (id: string) => void;
}

// Industry color map
const industryColor = (industry: string) => {
  const map: Record<string, string> = {
    'Manufacturing':       'bg-orange-100 text-orange-700',
    'Technology':          'bg-blue-100 text-blue-700',
    'Healthcare':          'bg-green-100 text-green-700',
    'Financial Services':  'bg-purple-100 text-purple-700',
    'Retail & E-Commerce': 'bg-pink-100 text-pink-700',
  };
  return map[industry] || 'bg-gray-100 text-gray-600';
};

// Influence badge
const influenceBadge = (level: string) => {
  if (level === 'high')   return 'bg-red-50 text-red-600 border border-red-100';
  if (level === 'medium') return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
  return 'bg-slate-50 text-slate-500 border border-slate-100';
};

// ─── Add Customer Modal ────────────────────────────────────────────────────────
interface AddCustomerModalProps {
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'recent_interactions'>) => void;
}

function AddCustomerModal({ onClose, onAdd }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [companySize, setCompanySize] = useState('Mid-Market (500-2,000 employees)');
  const [website, setWebsite] = useState('');
  const [concern, setConcern] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [competitor, setCompetitor] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onAdd({
      id,
      name: name.trim(),
      industry,
      company_size: companySize,
      website: website.trim() || undefined,
      stakeholders: [],
      concerns,
      competitors,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Add New Customer</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Company Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Industry + Size row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Technology','Manufacturing','Healthcare','Financial Services','Retail & E-Commerce','Education','Energy','Other'].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  'Startup (1-50 employees)',
                  'SMB (50-500 employees)',
                  'Mid-Market (500-2,000 employees)',
                  'Enterprise (2,000-5,000 employees)',
                  'Enterprise (5,000+ employees)',
                ].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Concerns */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Known Concerns</label>
            <div className="flex gap-2 mb-2">
              <input
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (concern.trim()) { setConcerns(p => [...p, concern.trim()]); setConcern(''); }
                  }
                }}
                placeholder="e.g. Pricing, Security..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => { if (concern.trim()) { setConcerns(p => [...p, concern.trim()]); setConcern(''); }}}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer">Add</button>
            </div>
            {concerns.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {concerns.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                    {c}
                    <button type="button" onClick={() => setConcerns(p => p.filter((_, j) => j !== i))} className="cursor-pointer hover:text-red-600"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Competitors */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Competitors</label>
            <div className="flex gap-2 mb-2">
              <input
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (competitor.trim()) { setCompetitors(p => [...p, competitor.trim()]); setCompetitor(''); }
                  }
                }}
                placeholder="e.g. Salesforce, SAP..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => { if (competitor.trim()) { setCompetitors(p => [...p, competitor.trim()]); setCompetitor(''); }}}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer">Add</button>
            </div>
            {competitors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {competitors.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-full">
                    vs {c}
                    <button type="button" onClick={() => setCompetitors(p => p.filter((_, j) => j !== i))} className="cursor-pointer hover:text-red-600"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main CustomersPage ────────────────────────────────────────────────────────
export default function CustomersPage({ onSelectCustomer }: CustomersPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.customers.list()
      .then(({ customers }) => setCustomers(customers))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allCustomers = useMemo(() => [...customers, ...extraCustomers], [customers, extraCustomers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allCustomers;
    return allCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.company_size.toLowerCase().includes(q) ||
      c.concerns.some(x => x.toLowerCase().includes(q)) ||
      c.competitors.some(x => x.toLowerCase().includes(q))
    );
  }, [allCustomers, search]);

  const handleAddCustomer = (customer: Omit<Customer, 'recent_interactions'>) => {
    setExtraCustomers(prev => [...prev, { ...customer, recent_interactions: [] }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCustomer}
        />
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500 text-sm mt-1">
              {allCustomers.length} customer{allCustomers.length !== 1 ? 's' : ''} total
              {search && filtered.length !== allCustomers.length && ` · ${filtered.length} matching`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
          >
            <UserPlus size={15} />
            Add Customer
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, industry, concern, or competitor..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Customers', value: allCustomers.length, icon: <Users size={16} className="text-blue-500" /> },
            { label: 'Enterprise', value: allCustomers.filter(c => c.company_size.toLowerCase().includes('enterprise')).length, icon: <Building2 size={16} className="text-purple-500" /> },
            { label: 'Industries', value: new Set(allCustomers.map(c => c.industry)).size, icon: <Building2 size={16} className="text-green-500" /> },
            { label: 'Showing', value: filtered.length, icon: <Search size={16} className="text-orange-500" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">{s.icon}</div>
              <div>
                <div className="text-lg font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Search size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No customers match "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-2 text-blue-600 text-sm hover:underline cursor-pointer">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CustomerCard key={c.id} customer={c} onClick={() => onSelectCustomer(c.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Customer Card ─────────────────────────────────────────────────────────────
function CustomerCard({ customer: c, onClick }: { customer: Customer; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {c.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm leading-snug">{c.name}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${industryColor(c.industry)}`}>
              {c.industry}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
      </div>

      {/* Company size */}
      <p className="text-xs text-slate-500 mb-3">{c.company_size}</p>

      {/* Stakeholders */}
      {c.stakeholders.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex -space-x-1.5">
            {c.stakeholders.slice(0, 3).map((s) => (
              <div key={s.name} title={`${s.name} — ${s.title}`}
                className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
                  s.influence === 'high' ? 'bg-red-500' : s.influence === 'medium' ? 'bg-yellow-500' : 'bg-slate-400'
                }`}>
                {s.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {c.stakeholders.length} stakeholder{c.stakeholders.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Concerns */}
      {c.concerns.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {c.concerns.slice(0, 2).map((concern) => (
            <span key={concern} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
              ⚠ {concern}
            </span>
          ))}
          {c.concerns.length > 2 && (
            <span className="text-xs text-slate-400">+{c.concerns.length - 2} more</span>
          )}
        </div>
      )}

      {/* Competitors */}
      {c.competitors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.competitors.slice(0, 2).map((comp) => (
            <span key={comp} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
              vs {comp}
            </span>
          ))}
          {c.competitors.length > 2 && (
            <span className="text-xs text-slate-400">+{c.competitors.length - 2} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {c.recent_interactions.length} interaction{c.recent_interactions.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-blue-600 font-medium group-hover:underline">View details →</span>
      </div>
    </div>
  );
}
