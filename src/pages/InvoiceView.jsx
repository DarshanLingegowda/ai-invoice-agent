import React from 'react';
import { X, Printer, Edit2 } from 'lucide-react';
import { calcTotals, formatCurrency, formatDate } from '../lib/invoiceStore';
import StatusBadge from '../components/StatusBadge';

export default function InvoiceView({ invoice, onClose, onEdit }) {
  const { subtotal, tax, total } = calcTotals(invoice.items);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,23,20,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24, backdropFilter: 'blur(4px)',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--paper)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 680,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeUp 0.25s ease',
      }}>
        {/* Invoice document */}
        <div style={{ padding: '40px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>Invoice</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', marginTop: 4 }}>{invoice.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge status={invoice.status} />
              <button onClick={onEdit} title="Edit" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', color: 'var(--ink-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-warm)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              ><Edit2 size={14} /></button>
              <button onClick={onClose} title="Close" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', color: 'var(--ink-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-warm)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              ><X size={16} /></button>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={sectionLabel}>From</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Your Company</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2, lineHeight: 1.6 }}>your@email.com</div>
            </div>
            <div>
              <div style={sectionLabel}>Bill To</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{invoice.client.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2, lineHeight: 1.6 }}>
                {invoice.client.email}<br />
                {invoice.client.address}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 28, padding: '16px', background: 'var(--paper-warm)', borderRadius: 'var(--radius)', border: '1px solid var(--paper-border)' }}>
            <div>
              <div style={sectionLabel}>Issue Date</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{formatDate(invoice.issueDate)}</div>
            </div>
            <div>
              <div style={sectionLabel}>Due Date</div>
              <div style={{ fontSize: 14, color: invoice.status === 'overdue' ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>{formatDate(invoice.dueDate)}</div>
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 100px', gap: 12, padding: '8px 0', borderBottom: '2px solid var(--ink)', marginBottom: 8 }}>
              {['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                <div key={h} style={{ ...sectionLabel, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
            {invoice.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 100px', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--paper-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--ink)' }}>{item.description}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-muted)', textAlign: 'right' }}>{item.qty}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-muted)', textAlign: 'right' }}>{formatCurrency(item.rate)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(item.qty * item.rate)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ minWidth: 240 }}>
              <TotRow label="Subtotal" val={formatCurrency(subtotal)} />
              <TotRow label="Tax (10%)" val={formatCurrency(tax)} />
              <div style={{ height: 1, background: 'var(--ink)', margin: '8px 0' }} />
              <TotRow label="Total" val={formatCurrency(total)} bold />
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ padding: '14px', background: 'var(--paper-warm)', borderRadius: 'var(--radius)', border: '1px solid var(--paper-border)' }}>
              <div style={sectionLabel}>Notes</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6 }}>{invoice.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--ink-muted)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-mono)',
  marginBottom: 4,
};

function TotRow({ label, val, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', gap: 24 }}>
      <span style={{ fontSize: 13, color: bold ? 'var(--ink)' : 'var(--ink-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: bold ? 700 : 500 }}>{val}</span>
    </div>
  );
}
