import React, { useState, useEffect } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomersPage from './components/CustomersPage';
import CustomerDetail from './components/CustomerDetail';
import DealsPage from './components/DealsPage';
import MemoryLab from './components/MemoryLab';
import AgentChat from './components/AgentChat';

export type Page = 'dashboard' | 'customers' | 'deals' | 'memory-lab' | 'chat';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [healthInfo, setHealthInfo] = useState<{ hindsight_configured: boolean; groq_configured: boolean } | null>(null);

  useEffect(() => {
    api.health()
      .then((h) => {
        setBackendStatus('ok');
        setHealthInfo(h);
      })
      .catch(() => setBackendStatus('error'));
  }, []);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentPage('customers');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSelectCustomer={handleSelectCustomer} />;

      case 'customers':
        // If a customer is selected, show detail view; otherwise show customers list
        return selectedCustomerId
          ? <CustomerDetail
              customerId={selectedCustomerId}
              onBack={() => setSelectedCustomerId(null)}
            />
          : <CustomersPage onSelectCustomer={(id) => setSelectedCustomerId(id)} />;

      case 'deals':
        return <DealsPage onSelectCustomer={handleSelectCustomer} />;

      case 'memory-lab':
        return <MemoryLab />;

      case 'chat':
        return <AgentChat />;

      default:
        return <Dashboard onSelectCustomer={handleSelectCustomer} />;
    }
  };

  // When navigating away from customers, clear selected customer
  const handleNavigate = (page: Page) => {
    if (page !== 'customers') {
      setSelectedCustomerId(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Backend status bar */}
        {backendStatus !== 'ok' && (
          <div className={`px-4 py-2 text-sm text-center font-medium ${
            backendStatus === 'error'
              ? 'bg-red-50 text-red-700 border-b border-red-200'
              : 'bg-yellow-50 text-yellow-700 border-b border-yellow-200'
          }`}>
            {backendStatus === 'error'
              ? '⚠️ Backend not reachable — make sure the DealMind backend is running on port 8000'
              : '⏳ Connecting to DealMind backend...'}
          </div>
        )}
        {healthInfo && (!healthInfo.hindsight_configured || !healthInfo.groq_configured) && (
          <div className="px-4 py-2 text-sm text-center font-medium bg-amber-50 text-amber-700 border-b border-amber-200">
            {!healthInfo.hindsight_configured && '⚠️ HINDSIGHT_API_KEY not set — memory features disabled. '}
            {!healthInfo.groq_configured && '⚠️ GROQ_API_KEY not set — AI features disabled.'}
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
