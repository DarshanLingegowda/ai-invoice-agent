import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import AgentPage from './pages/AgentPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { SEED_INVOICES, calcTotals, isOverdue } from './lib/invoiceStore';

const STORAGE_KEY = 'invoice_agent_data';
const API_KEY_STORAGE = 'invoice_agent_api_key';

function loadInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return SEED_INVOICES;
}

function saveInvoices(invoices) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices)); } catch (_) {}
}

export default function App() {
  const [page, setPage] = useState('invoices');
  const [invoices, setInvoices] = useState(() => {
    const loaded = loadInvoices();
    // Auto-mark overdue
    return loaded.map(inv => isOverdue(inv) ? { ...inv, status: 'overdue' } : inv);
  });
  const [editing, setEditing] = useState(null); // invoice being edited (null = create new)
  const [viewing, setViewing] = useState(null); // invoice being viewed
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');

  // Patch fetch to inject API key header
  useEffect(() => {
    const orig = window.fetch.bind(window);
    window._origFetch = orig;
    window.fetch = (url, opts = {}) => {
      if (typeof url === 'string' && url.includes('api.anthropic.com')) {
GOOGLE_API_KEY=your_api_key_here
        opts = {
          ...opts,
          headers: {
            ...(opts.headers || {}),
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
        };
      }
      return orig(url, opts);
    };
    return () => { window.fetch = window._origFetch; };
  }, []);

  const persist = (updated) => {    setInvoices(updated);
    saveInvoices(updated);
  };

  const handleSave = (invoice) => {
    const exists = invoices.find(i => i.id === invoice.id);
    const updated = exists
      ? invoices.map(i => i.id === invoice.id ? invoice : i)
      : [...invoices, invoice];
    persist(updated);
    setShowForm(false);
    setEditing(null);
    setPage('invoices');
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this invoice?')) return;
    persist(invoices.filter(i => i.id !== id));
  };

  const handleStatusChange = (id, status) => {
    persist(invoices.map(i => i.id === id ? { ...i, status } : i));
  };

  const handleAgentAction = (action) => {
    if (!action) return null;
    if (action.action === 'create_invoice') {
      const today = new Date().toISOString().split('T')[0];
      const newInv = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        client: action.client || { name: 'New Client', email: '', address: '' },
        issueDate: today,
        dueDate: action.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'draft',
        items: (action.items || []).map((it, i) => ({ id: i + 1, ...it })),
        notes: action.notes || '',
        currency: 'USD',
      };
      persist([...invoices, newInv]);
      return `✓ Invoice ${newInv.id} created for ${newInv.client.name}`;
    }
    if (action.action === 'update_status') {
      handleStatusChange(action.id, action.status);
      return `✓ ${action.id} marked as ${action.status}`;
    }
    return null;
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const handleNewInvoice = () => {
    setEditing(null);
    setShowForm(true);
    setPage('form');
  };

  const handleEdit = (inv) => {
    setEditing(inv);
    setShowForm(true);
    setPage('form');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setPage('invoices');
  };

  const apiKeyMissing = !apiKey && !import.meta.env.VITE_ANTHROPIC_API_KEY;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        page={page}
        onPage={(p) => { setPage(p); setShowForm(false); }}
        onNewInvoice={handleNewInvoice}
      />

      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--paper)' }}>
        {page === 'form' && (
          <InvoiceForm
            invoice={editing}
            onSave={handleSave}
            onCancel={handleCancelForm}
          />
        )}
        {page === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            onView={setViewing}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
        {page === 'agent' && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AgentPage
              invoices={invoices}
              onAction={handleAgentAction}
              apiKeyMissing={apiKeyMissing}
            />
          </div>
        )}
        {page === 'analytics' && <Analytics invoices={invoices} />}
        {page === 'settings' && <Settings apiKey={apiKey} onSave={handleSaveApiKey} />}
      </main>

      {/* View Modal */}
      {viewing && (
        <InvoiceView
          invoice={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { handleEdit(viewing); setViewing(null); }}
        />
      )}
    </div>
  );
}
