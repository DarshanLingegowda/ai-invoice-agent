import React from 'react';
import { TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { calcTotals, formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '../lib/invoiceStore';

export default function Analytics({ invoices }) {
  const withTotals = invoices.map(inv => ({ ...inv, ...calcTotals(inv.items) }));

  const totalRevenue = withTotals.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = withTotals.filter(i => i.status === 'SENT' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const totalOverdue = withTotals.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const totalDraft = withTotals.filter(i => i.status === 'draft').reduce((s, i) => s + i.total, 0);

  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  const clientTotals = withTotals.reduce((acc, inv) => {
    const name = inv.client.name;
    if (!acc[name]) acc[name] = { name, total: 0, count: 0 };
    acc[name].total += inv.total;
    acc[name].count++;
    return acc;
  }, {});

  const topClients = Object.values(clientTotals).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxClientTotal = topClients[0]?.total || 1;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink)', lineHeight: 1.1 }}>Analytics</h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginTop: 4 }}>Financial overview across {invoices.length} invoices</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard icon={CheckCircle} label="Total Revenue" value={formatCurrency(totalRevenue)} color="var(--green)" iconBg="var(--green-soft)" />
        <KpiCard icon={Clock} label="Outstanding" value={formatCurrency(totalOutstanding)} color="var(--blue)" iconBg="var(--blue-soft)" />
        <KpiCard icon={AlertCircle} label="Overdue" value={formatCurrency(totalOverdue)} color="var(--accent)" iconBg="var(--accent-soft)" />
        <KpiCard icon={FileText} label="In Draft" value={formatCurrency(totalDraft)} color="var(--gold)" iconBg="var(--gold-soft)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Status Breakdown */}
        <div style={{ background: '#fff', border: '1px solid var(--paper-border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionTitle>Invoice Status</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
              const pct = Math.round((count / invoices.length) * 100);
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>{STATUS_LABELS[status]}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)' }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--paper-warm)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors.text, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients */}
        <div style={{ background: '#fff', border: '1px solid var(--paper-border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <SectionTitle>Top Clients by Value</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {topClients.map((client, i) => {
              const pct = Math.round((client.total / maxClientTotal) * 100);
              return (
                <div key={client.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', marginRight: 6 }}>#{i + 1}</span>
                      {client.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>{formatCurrency(client.total)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--paper-warm)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ink)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', border: '1px solid var(--paper-border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', gridColumn: '1 / -1' }}>
          <SectionTitle>Invoice Timeline</SectionTitle>
          <div style={{ marginTop: 16 }}>
            {[...withTotals]
              .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
              .map((inv, i, arr) => {
                const colors = STATUS_COLORS[inv.status] || STATUS_COLORS.draft;
                return (
                  <div key={inv.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--paper-border)' : 'none',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: colors.text,
                    }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{inv.client.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', marginLeft: 8 }}>{inv.id}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{formatDate(inv.issueDate)}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', minWidth: 80, textAlign: 'right' }}>
                      {formatCurrency(inv.total)}
                    </div>
                    <div style={{
                      padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      {STATUS_LABELS[inv.status]}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, iconBg }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--paper-border)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
      {children}
    </div>
  );
}
