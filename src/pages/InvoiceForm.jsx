import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { calcTotals, formatCurrency, nextId } from '../lib/invoiceStore';

const emptyItem = () => ({ id: Date.now(), description: '', qty: 1, rate: 0 });
const today = () => new Date().toISOString().split('T')[0];
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export default function InvoiceForm({ invoice, onSave, onCancel }) {
  const isEdit = !!invoice?.id;

  const [form, setForm] = useState(() => invoice || {
    id: nextId(),
    client: { name: '', email: '', address: '' },
    issueDate: today(),
    dueDate: addDays(30),
    status: 'draft',
    items: [emptyItem()],
    notes: '',
    currency: 'USD',
  });

  const setClient = (field, val) =>
    setForm(f => ({ ...f, client: { ...f.client, [field]: val } }));

  const setItem = (id, field, val) =>
    setForm(f => ({
      ...f,
      items: f.items.map(it => it.id === id ? { ...it, [field]: field === 'qty' || field === 'rate' ? parseFloat(val) || 0 : val } : it),
    }));

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));

  const { subtotal, tax, total } = calcTotals(form.items);

  const handleSave = (status) => {
    if (!form.client.name) { alert('Please enter a client name.'); return; }
    onSave({ ...form, status: status || form.status });
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', fontSize: 13 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--paper-border)' }} />
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)' }}>
          {isEdit ? `Edit ${form.id}` : `New Invoice · ${form.id}`}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Client */}
        <Card title="Bill To">
          <Field label="Client Name" value={form.client.name} onChange={v => setClient('name', v)} placeholder="Acme Corp" />
          <Field label="Email" value={form.client.email} onChange={v => setClient('email', v)} placeholder="billing@acme.com" type="email" />
          <Field label="Address" value={form.client.address} onChange={v => setClient('address', v)} placeholder="123 Main St, City, State" multiline />
        </Card>

        {/* Dates */}
        <Card title="Invoice Details">
          <Field label="Invoice Number" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} />
          <Field label="Issue Date" value={form.issueDate} onChange={v => setForm(f => ({ ...f, issueDate: v }))} type="date" />
          <Field label="Due Date" value={form.dueDate} onChange={v => setForm(f => ({ ...f, dueDate: v }))} type="date" />
        </Card>
      </div>

      {/* Line Items */}
      <Card title="Line Items" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 100px 32px', gap: 8, marginBottom: 8 }}>
          {['Description', 'Qty', 'Rate', 'Amount', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', textAlign: i >= 2 ? 'right' : 'left' }}>
              {h}
            </div>
          ))}
        </div>

        {form.items.map(item => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input
              value={item.description}
              onChange={e => setItem(item.id, 'description', e.target.value)}
              placeholder="Service or product description"
              style={inputStyle}
            />
            <input
              value={item.qty}
              onChange={e => setItem(item.id, 'qty', e.target.value)}
              type="number" min="0"
              style={{ ...inputStyle, textAlign: 'right' }}
            />
            <input
              value={item.rate}
              onChange={e => setItem(item.id, 'rate', e.target.value)}
              type="number" min="0" step="0.01"
              style={{ ...inputStyle, textAlign: 'right' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'right', color: 'var(--ink)', fontWeight: 500 }}>
              {formatCurrency(item.qty * item.rate)}
            </div>
            <button onClick={() => removeItem(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', width: 28, height: 28 }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <button
          onClick={addItem}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--blue)', marginTop: 8, fontWeight: 500 }}
        >
          <Plus size={14} /> Add line item
        </button>

        {/* Totals */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--paper-border)' }}>
          <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
          <TotalRow label="Tax (10%)" value={formatCurrency(tax)} />
          <TotalRow label="Total" value={formatCurrency(total)} bold />
        </div>
      </Card>

      {/* Notes */}
      <Card title="Notes" style={{ marginBottom: 28 }}>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Payment terms, thank you note, etc."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
        />
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => handleSave('draft')} style={btnStyle('secondary')}>
          <Save size={14} /> Save Draft
        </button>
        <button onClick={() => handleSave('SENT')} style={btnStyle('primary')}>
          Save & Mark Sent
        </button>
        <button onClick={onCancel} style={{ ...btnStyle('ghost'), marginLeft: 'auto' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Card({ title, children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--paper-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline }) {
  const style = { ...inputStyle, width: '100%', marginBottom: 10 };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} style={{ ...style, resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={style} />
      )}
    </div>
  );
}

function TotalRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 48, marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: bold ? 'var(--ink)' : 'var(--ink-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: bold ? 700 : 500, minWidth: 90, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--paper-border)',
  borderRadius: 'var(--radius)',
  fontSize: 13,
  color: 'var(--ink)',
  background: 'var(--paper-warm)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

function btnStyle(variant) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '10px 20px', borderRadius: 'var(--radius)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
    transition: 'opacity 0.15s',
  };
  if (variant === 'primary') return { ...base, background: 'var(--ink)', color: 'var(--paper)' };
  if (variant === 'secondary') return { ...base, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--paper-border)' };
  return { ...base, background: 'transparent', color: 'var(--ink-muted)' };
}
