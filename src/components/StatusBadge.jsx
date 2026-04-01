import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../lib/invoiceStore';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontFamily: 'var(--font-mono)',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
