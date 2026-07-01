'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Inserisci sia username che password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante l\'accesso.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Impossibile connettersi al server. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div className="glass-panel animate-scale" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            marginBottom: '20px'
          }}>
            <img 
              src="/logo.png" 
              alt="Placid Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Accedi a Placid
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Inserisci le tue credenziali per accedere
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <span style={{ fontSize: '13px', lineHeight: '1.4' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Nome utente"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Password segreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Accesso in corso...</span>
              </>
            ) : (
              <span>Accedi</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
