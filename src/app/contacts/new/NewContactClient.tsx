'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Plus, Loader2, ArrowLeft, Users } from 'lucide-react';

interface NewContactClientProps {
  username: string;
}

export default function NewContactClient({ username }: NewContactClientProps) {
  const router = useRouter();

  // Add contact form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  
  // Status message states
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Add contact handler
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Compila tutti i campi.');
      return;
    }

    setAdding(true);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Errore durante l'aggiunta.");
      } else {
        setFormSuccess('Contatto aggiunto con successo!');
        setNewName('');
        setNewEmail('');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setFormError('Errore di connessione. Riprova.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header Panel */}
      <header className="glass-panel" style={{
        borderRadius: '0 0 16px 16px',
        borderTop: 'none',
        marginBottom: '32px',
        padding: '16px 24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)'
            }}>
              <Users size={18} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Placid<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/')} className="btn btn-secondary" style={{
              padding: '8px 14px',
              fontSize: '13px',
              borderRadius: '8px',
              gap: '6px'
            }}>
              <ArrowLeft size={14} />
              <span>Torna alla Rubrica</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container animate-fade" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        
        <div className="glass-panel" style={{ 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          maxWidth: '480px',
          width: '100%',
          marginTop: '32px'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Nuovo Contatto</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Aggiungi una nuova mail alla rubrica</p>
          </div>

          {formError && (
            <div className="alert alert-danger" style={{ padding: '12px', margin: 0, borderRadius: '8px' }}>
              <span style={{ fontSize: '13px' }}>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert alert-success" style={{ padding: '12px', margin: 0, borderRadius: '8px' }}>
              <span style={{ fontSize: '13px' }}>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '14px' }}>Nome Completo</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Es: Giuseppe Frattura"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={adding}
                  required
                  style={{ padding: '12px 14px 12px 42px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '14px' }}>Indirizzo Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Es: mail@esempio.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={adding}
                  required
                  style={{ padding: '12px 14px 12px 42px', fontSize: '14px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              {adding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Salvataggio in corso...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Aggiungi Contatto</span>
                </>
              )}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
