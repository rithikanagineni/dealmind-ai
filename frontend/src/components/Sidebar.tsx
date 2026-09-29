import React from 'react';
import type { Page } from '../App';
import {
  LayoutDashboard, Users, Briefcase, FlaskConical, MessageSquare, Settings, Brain, Bell, Search
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers' as Page, label: 'Customers', icon: Users },
  { id: 'deals' as Page, label: 'Deals', icon: Briefcase },
  { id: 'memory-lab' as Page, label: 'Memory Lab', icon: FlaskConical },
  { id: 'chat' as Page, label: 'Ask DealMind', icon: MessageSquare },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div className="w-60 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm shrink-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">DealMind</div>
            <div className="text-xs text-slate-500 leading-tight">Sales Intelligence</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs text-slate-600 placeholder:text-slate-400 outline-none flex-1 w-full"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              {label}
              {id === 'memory-lab' && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer">
          <Settings size={16} className="text-slate-400" />
          Settings
        </button>
        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">Sales Rep</div>
            <div className="text-xs text-slate-500 truncate">Account Executive</div>
          </div>
          <Bell size={14} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
