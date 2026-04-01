import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff } from 'lucide-react';

export default function Settings({ apiKey, onSave }) {
  const [key, setKey] = useState(apiKey || '');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink)', marginBottom: 8 }}>Settings</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28 }}>Configure your Invoice Agent</p>

      <div style={{ background: '#fff', border: '1px solid var(--paper-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Key size={16} color="var(--ink-muted)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Anthropic API Key</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 14, lineHeight: 1.6 }}>
          Required for the AI Agent feature. Get your key from{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>
            console.anthropic.com
          </a>
        </p>
        <div style={{ position: 'relative' }}>
          <input
            value={key}
            onChange={e => setKey(e.target.value)}
            type={show ? 'text' : 'password'}
GOOGLE_API_KEY=your_api_key_here
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: '1px solid var(--paper-border)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              background: 'var(--paper-warm)',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
          Stored in localStorage — never sent anywhere except Anthropic's API
        </div>

        <button
          onClick={handleSave}
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 18px',
            background: saved ? 'var(--green)' : 'var(--ink)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          <Save size={13} />
          {saved ? 'Saved!' : 'Save API Key'}
        </button>
      </div>
    </div>
  );
}
