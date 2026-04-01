import React, { useState } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, Send, CheckCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate, calcTotals, STATUS_LABELS } from '../lib/invoiceStore';

export default function InvoiceList({ invoices, onView, onEdit, onDelete, onStatusChange }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'draft', 'SENT', 'paid', 'overdue', 'cancelled'];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink)', lineHeight: 1.1 }}>
          Invoices
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginTop: 4 }}>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1px solid var(--paper-border)',
              borderRadius: 'var(--radius)',
              background: '#fff',
              fontSize: 13,
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 13px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                border: '1px solid',
                borderColor: filterStatus === s ? 'var(--ink)' : 'var(--paper-border)',
                background: filterStatus === s ? 'var(--ink)' : '#fff',
                color: filterStatus === s ? 'var(--paper)' : 'var(--ink-muted)',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--paper-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 120px 110px 110px 100px',
          padding: '10px 20px',
          background: 'var(--paper-warm)',
          borderBottom: '1px solid var(--paper-border)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--ink-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>Invoice</span>
          <span>Client</span>
          <span>Amount</span>
          <span>Due Date</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 14 }}>
            No invoices found
          </div>
        ) : (
          filtered.map((inv, idx) => {
            const { total } = calcTotals(inv.items);
            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 120px 110px 110px 100px',
                  padding: '14px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--paper-border)' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-warm)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>
                  {inv.id}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{inv.client.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>{inv.client.email}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {formatCurrency(total)}
                </span>
                <span style={{ fontSize: 13, color: inv.status === 'overdue' ? 'var(--accent)' : 'var(--ink-soft)' }}>
                  {formatDate(inv.dueDate)}
                </span>
                <StatusBadge status={inv.status} />
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <ActionBtn icon={Eye} title="View" onClick={() => onView(inv)} />
                  <ActionBtn icon={Edit2} title="Edit" onClick={() => onEdit(inv)} />
                  {inv.status === 'draft' && (
                    <ActionBtn icon={Send} title="Mark as Sent" onClick={() => onStatusChange(inv.id, 'SENT')} color="var(--blue)" />
                  )}
                  {inv.status === 'SENT' && (
                    <ActionBtn icon={CheckCircle} title="Mark as Paid" onClick={() => onStatusChange(inv.id, 'paid')} color="var(--green)" />
                  )}
                  <ActionBtn icon={Trash2} title="Delete" onClick={() => onDelete(inv.id)} color="var(--accent)" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, color = 'var(--ink-muted)' }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius)',
        color,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-warm)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={14} />
    </button>
  );
}
