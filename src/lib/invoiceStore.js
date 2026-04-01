// Invoice data store & utilities

export const STATUSES = {
  DRAFT: 'draft',
  SENT: 'SENT',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const STATUS_LABELS = {
  draft: 'Draft',
  SENT: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  draft: { bg: 'var(--paper-warm)', border: 'var(--paper-border)', text: 'var(--ink-muted)' },
  SENT: { bg: 'var(--blue-soft)', border: '#b3cfe8', text: 'var(--blue)' },
  paid: { bg: 'var(--green-soft)', border: '#b2d8c3', text: 'var(--green)' },
  overdue: { bg: '#fde8e4', border: '#f0bdb4', text: 'var(--accent)' },
  cancelled: { bg: 'var(--paper-warm)', border: 'var(--paper-border)', text: 'var(--ink-muted)' },
};

let _id = 1000;
export const nextId = () => `INV-${++_id}`;

export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const isOverdue = (invoice) => {
  if (invoice.status !== 'SENT') return false;
  return new Date(invoice.dueDate) < new Date();
};

export const calcTotals = (items) => {
  const subtotal = items.reduce((s, i) => s + (i.qty * i.rate), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

// Seed data
const today = new Date();
const d = (offset) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};

export const SEED_INVOICES = [
  {
    id: 'INV-1001',
    client: { name: 'Meridian Studio', email: 'billing@meridian.io', address: '42 West 10th St, New York, NY 10011' },
    issueDate: d(-30),
    dueDate: d(-10),
    status: 'paid',
    items: [
      { id: 1, description: 'Brand Identity Design', qty: 1, rate: 4500 },
      { id: 2, description: 'Logo Variations (3x)', qty: 3, rate: 400 },
    ],
    notes: 'Thank you for your business!',
    currency: 'USD',
  },
  {
    id: 'INV-1002',
    client: { name: 'Foresight Labs', email: 'accounts@foresight.ai', address: '100 Mission St, San Francisco, CA 94105' },
    issueDate: d(-14),
    dueDate: d(16),
    status: 'SENT',
    items: [
      { id: 1, description: 'UX Research & Audit', qty: 1, rate: 3200 },
      { id: 2, description: 'Wireframe Prototypes', qty: 8, rate: 250 },
    ],
    notes: 'Payment due within 30 days.',
    currency: 'USD',
  },
  {
    id: 'INV-1003',
    client: { name: 'Volta Collective', email: 'finance@volta.co', address: '55 King St W, Toronto, ON M5K 1E7' },
    issueDate: d(-45),
    dueDate: d(-5),
    status: 'overdue',
    items: [
      { id: 1, description: 'Web Development (Frontend)', qty: 40, rate: 120 },
      { id: 2, description: 'CMS Integration', qty: 1, rate: 800 },
    ],
    notes: 'Late fee applies after 30 days.',
    currency: 'USD',
  },
  {
    id: 'INV-1004',
    client: { name: 'Arclight Media', email: 'hello@arclight.media', address: '88 Pacific Ave, Los Angeles, CA 90210' },
    issueDate: d(-3),
    dueDate: d(27),
    status: 'draft',
    items: [
      { id: 1, description: 'Motion Graphics Package', qty: 1, rate: 2200 },
    ],
    notes: '',
    currency: 'USD',
  },
];
