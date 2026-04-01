import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { askAgent } from '../lib/agent';
import { formatCurrency, calcTotals } from '../lib/invoiceStore';

const QUICK_PROMPTS = [
  'What is my total outstanding amount?',
  'Show me a summary of all invoices',
  'Which invoices are overdue?',
  'Create an invoice for Apex Design, UI audit, $2400',
  'What is my total revenue from paid invoices?',
];

export default function AgentPage({ invoices, onAction, apiKeyMissing }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your Invoice Agent powered by Gemini. I can help you query your invoices, create new ones, update statuses, and provide financial insights. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const { text: reply, action } = await askAgent(apiMessages, invoices);

      setMessages(m => [...m, { role: 'assistant', content: reply || '✓ Action completed.' }]);

      if (action) {
        const result = onAction(action);
        if (result) {
          setNotification({ type: 'success', text: result });
          setTimeout(() => setNotification(null), 4000);
        }
      }
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Something went wrong. Please check your API configuration.'}`,
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ padding: '28px 0 16px', borderBottom: '1px solid var(--paper-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="var(--paper)" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.1 }}>Invoice Agent</h1>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={10} fill="var(--gold)" color="var(--gold)" />
              Powered by Gemini AI
            </div>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {apiKeyMissing && (
        <div style={{
          margin: '12px 0',
          padding: '12px 16px',
          background: '#fff8e6',
          border: '1px solid #f5d87a',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          color: '#8a6200',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>API key required:</strong> Set your Anthropic API key in the <code style={{ background: '#ffedb5', padding: '1px 4px', borderRadius: 3 }}>VITE_ANTHROPIC_API_KEY</code> environment variable (or in Settings) to enable AI features.
          </span>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div style={{
          margin: '8px 0',
          padding: '10px 14px',
          background: 'var(--green-soft)',
          border: '1px solid #b2d8c3',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          color: 'var(--green)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexShrink: 0,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle size={14} />
          {notification.text}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ flexShrink: 0, paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => send(p)}
              disabled={loading}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                border: '1px solid var(--paper-border)',
                borderRadius: 99,
                background: '#fff',
                fontSize: 12,
                color: 'var(--ink-soft)',
                cursor: loading ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--ink)'; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--paper-border)'}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex',
          gap: 10,
          padding: '10px',
          background: '#fff',
          border: '1px solid var(--paper-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your invoices or request an action..."
            disabled={loading}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--ink)',
              background: 'transparent',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36,
              borderRadius: 'var(--radius)',
              background: input.trim() && !loading ? 'var(--ink)' : 'var(--paper-border)',
              color: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeUp 0.25s ease',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--accent-soft)' : 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
      }}>
        {isUser ? <User size={14} color="var(--accent)" /> : <Bot size={14} color="var(--paper)" />}
      </div>
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background: isUser ? 'var(--ink)' : '#fff',
        color: isUser ? 'var(--paper)' : 'var(--ink)',
        fontSize: 14,
        lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid var(--paper-border)',
        boxShadow: 'var(--shadow-sm)',
        whiteSpace: 'pre-wrap',
        ...(msg.error ? { background: '#fff5f4', color: 'var(--accent)', border: '1px solid var(--accent-soft)' } : {}),
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bot size={14} color="var(--paper)" />
      </div>
      <div style={{ padding: '12px 16px', background: '#fff', border: '1px solid var(--paper-border)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-muted)',
            animation: 'pulse 1.2s ease infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
