import React from 'react';
import { FileText, MessageSquare, BarChart2, PlusCircle, Settings } from 'lucide-react';

const navItems = [
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'agent', label: 'AI Agent', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar({ page, onPage, onNewInvoice }) {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--paper)', letterSpacing: '-0.01em' }}>
          Invoice
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em', marginTop: 2 }}>
          AGENT ◆ AI
        </div>
      </div>

      {/* New Invoice */}
      <div style={{ padding: '16px 16px 8px' }}>
        <button
          onClick={onNewInvoice}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.01em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <PlusCircle size={15} />
          New Invoice
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 16px' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onPage(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                marginBottom: 2,
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? 'var(--paper)' : 'rgba(255,255,255,0.45)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
          POWERED BY CLAUDE
        </div>
      </div>
    </aside>
  );
}
