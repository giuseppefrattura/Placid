'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Search, 
  Plus, 
  Trash2, 
  LogOut, 
  Copy, 
  Check, 
  Database,
  Loader2,
  Users,
  Lock,
  UserPlus,
  KeyRound,
  Calendar,
  CalendarDays
} from 'lucide-react';

interface Consultation {
  id: number;
  consultation_date: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  created_at: string;
  consultations?: Consultation[];
}


interface DashboardClientProps {
  initialContacts: Contact[];
  username: string;
  dbError: boolean;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff007f, #ff7f00)',
  'linear-gradient(135deg, #ec4899, #d946ef)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #84cc16)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
];

export default function DashboardClient({ 
  initialContacts, 
  username, 
  dbError 
}: DashboardClientProps) {
  const router = useRouter();
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'latestConsultation'>('name');
  
  // Add contact form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  
  // Status message states
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // UI interactive states
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Security Tab & Forms states
  const [securityTab, setSecurityTab] = useState<'password' | 'createUser'>('password');
  
  // Create user states
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  
  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  // Expanded contact for consultations
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null);
  const [consultationDates, setConsultationDates] = useState<Record<number, string>>({});
  const [addingConsultationIds, setAddingConsultationIds] = useState<Set<number>>(new Set());
  const [deletingConsultationIds, setDeletingConsultationIds] = useState<Set<number>>(new Set());

  // Create consultation handler
  const handleAddConsultation = async (contactId: number, e: React.FormEvent) => {
    e.preventDefault();
    const date = consultationDates[contactId];
    if (!date) return;

    setAddingConsultationIds((prev) => {
      const next = new Set(prev);
      next.add(contactId);
      return next;
    });

    try {
      const res = await fetch(`/api/contacts/${contactId}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationDate: date }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante l'aggiunta della consulenza");
      } else {
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === contactId) {
              const currentConsultations = c.consultations || [];
              const updatedConsultations = [...currentConsultations, data.consultation].sort(
                (a, b) => b.consultation_date.localeCompare(a.consultation_date)
              );
              return { ...c, consultations: updatedConsultations };
            }
            return c;
          })
        );
        setConsultationDates((prev) => ({ ...prev, [contactId]: '' }));
      }
    } catch (err) {
      alert("Errore di rete durante l'inserimento della consulenza.");
    } finally {
      setAddingConsultationIds((prev) => {
        const next = new Set(prev);
        next.delete(contactId);
        return next;
      });
    }
  };

  // Delete consultation handler
  const handleDeleteConsultation = async (contactId: number, consultationId: number) => {
    setDeletingConsultationIds((prev) => {
      const next = new Set(prev);
      next.add(consultationId);
      return next;
    });

    try {
      const res = await fetch(`/api/contacts/${contactId}/consultations?consultationId=${consultationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante la rimozione della consulenza");
      } else {
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === contactId) {
              const currentConsultations = c.consultations || [];
              const updatedConsultations = currentConsultations.filter((con) => con.id !== consultationId);
              return { ...c, consultations: updatedConsultations };
            }
            return c;
          })
        );
      }
    } catch (err) {
      alert("Errore di rete durante la cancellazione della consulenza.");
    } finally {
      setDeletingConsultationIds((prev) => {
        const next = new Set(prev);
        next.delete(consultationId);
        return next;
      });
    }
  };

  // Clear security success/error alerts after 5 seconds

  useEffect(() => {
    if (createSuccess || createError) {
      const timer = setTimeout(() => {
        setCreateSuccess('');
        setCreateError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess, createError]);

  useEffect(() => {
    if (changeSuccess || changeError) {
      const timer = setTimeout(() => {
        setChangeSuccess('');
        setChangeError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [changeSuccess, changeError]);

  // Create user handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!createUsername.trim() || !createPassword.trim()) {
      setCreateError('Compila tutti i campi.');
      return;
    }

    setCreateLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: createUsername.trim(), password: createPassword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Errore durante la creazione.');
      } else {
        setCreateSuccess('Utente creato con successo!');
        setCreateUsername('');
        setCreatePassword('');
      }
    } catch (err) {
      setCreateError('Errore di connessione. Riprova.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (!currentPassword.trim() || !newPassword.trim()) {
      setChangeError('Compila tutti i campi.');
      return;
    }

    setChangeLoading(true);

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChangeError(data.error || 'Errore durante la modifica.');
      } else {
        setChangeSuccess('Password modificata con successo!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setChangeError('Errore di connessione. Riprova.');
    } finally {
      setChangeLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
        setFormError(data.error || 'Errore durante l\'aggiunta.');
      } else {
        // Add to state and sort alphabetically by name
        const updatedContacts = [...contacts, data.contact].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setContacts(updatedContacts);
        setNewName('');
        setNewEmail('');
        setFormSuccess('Contatto aggiunto con successo!');
      }
    } catch (err) {
      setFormError('Errore di connessione. Riprova.');
    } finally {
      setAdding(false);
    }
  };

  // Delete contact handler
  const handleDeleteContact = async (id: number) => {
    // Add to deleting set
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Impossibile eliminare il contatto.');
      } else {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert('Errore di rete durante l\'eliminazione.');
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Copy email to clipboard handler
  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get contact initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get a consistent color gradient based on name hash
  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((c) => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by latest consultation date (descending, meaning most recent first)
        const dateA = a.consultations && a.consultations.length > 0
          ? a.consultations[0].consultation_date
          : '';
        const dateB = b.consultations && b.consultations.length > 0
          ? b.consultations[0].consultation_date
          : '';
          
        if (!dateA && !dateB) return a.name.localeCompare(b.name);
        if (!dateA) return 1;  // empty dates go to the bottom
        if (!dateB) return -1;
        
        return dateB.localeCompare(dateA); // descending (newer dates first)
      }
    });


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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--success)'
              }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Utente:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{username}</span>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary" style={{
              padding: '8px 14px',
              fontSize: '13px',
              borderRadius: '8px',
              gap: '6px'
            }}>
              <LogOut size={14} />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container animate-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* DB Connection Alert (if failed) */}
        {dbError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', margin: 0 }}>
            <Database size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', fontSize: '15px' }}>
                Connessione al database non riuscita
              </strong>
              <span style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.4' }}>
                L&apos;applicazione non è riuscita a raggiungere il server PostgreSQL remoto all&apos;indirizzo <code>truenas.giuseppefrattura.it:5433</code>.
                Per permetterti di testare l&apos;applicazione, stiamo utilizzando una lista contatti mock in memoria. 
                Controlla la configurazione del tuo database nel file <code>.env.local</code>.
              </span>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }} className="dashboard-grid">
          {/* Form and List Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '32px',
            alignItems: 'start'
          }} className="dashboard-layout">
            
            {/* Left Column: Form + Security Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Nuovo Contatto Form */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Nuovo Contatto</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Aggiungi una mail alla rubrica</p>
                </div>

                {formError && (
                  <div className="alert alert-danger" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px' }}>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="alert alert-success" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px' }}>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={16} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Es: Giuseppe Frattura"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        disabled={adding}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Indirizzo Email</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={16} />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Es: mail@esempio.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={adding}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={adding} style={{ width: '100%', padding: '10px' }}>
                    {adding ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Salvataggio...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Aggiungi Contatto</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security & Access Management Form */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Sicurezza & Accessi</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Gestisci password e nuovi utenti</p>
                </div>

                {/* Tab Switcher */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '4px',
                  gap: '4px'
                }}>
                  <button
                    type="button"
                    onClick={() => setSecurityTab('password')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: securityTab === 'password' ? 'var(--primary)' : 'transparent',
                      color: securityTab === 'password' ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <KeyRound size={14} />
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecurityTab('createUser')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: securityTab === 'createUser' ? 'var(--primary)' : 'transparent',
                      color: securityTab === 'createUser' ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserPlus size={14} />
                    Nuovo Utente
                  </button>
                </div>

                {/* Tab 1: Change Password */}
                {securityTab === 'password' && (
                  username.toLowerCase() === 'admin' ? (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--border-color)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      textAlign: 'center'
                    }}>
                      L&apos;utente <strong>admin</strong> è configurato nel file <code>.env.local</code>. La sua password è statica e non può essere modificata da qui.
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {changeError && (
                        <div className="alert alert-danger" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px' }}>{changeError}</span>
                        </div>
                      )}
                      {changeSuccess && (
                        <div className="alert alert-success" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px' }}>{changeSuccess}</span>
                        </div>
                      )}
                      <div className="form-group">
                        <label className="form-label">Password Attuale</label>
                        <div className="input-wrapper">
                          <Lock className="input-icon" size={16} />
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Inserisci password attuale"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={changeLoading}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Nuova Password</label>
                        <div className="input-wrapper">
                          <Lock className="input-icon" size={16} />
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Almeno 6 caratteri"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={changeLoading}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={changeLoading} style={{ width: '100%', padding: '10px' }}>
                        {changeLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Aggiornamento...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound size={16} />
                            <span>Cambia Password</span>
                          </>
                        )}
                      </button>
                    </form>
                  )
                )}

                {/* Tab 2: Create User */}
                {securityTab === 'createUser' && (
                  <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {createError && (
                      <div className="alert alert-danger" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px' }}>{createError}</span>
                      </div>
                    )}
                    {createSuccess && (
                      <div className="alert alert-success" style={{ padding: '10px 12px', margin: 0, borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px' }}>{createSuccess}</span>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={16} />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Nuovo username"
                          value={createUsername}
                          onChange={(e) => setCreateUsername(e.target.value)}
                          disabled={createLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Password iniziale</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={16} />
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Almeno 6 caratteri"
                          value={createPassword}
                          onChange={(e) => setCreatePassword(e.target.value)}
                          disabled={createLoading}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={createLoading} style={{ width: '100%', padding: '10px' }}>
                      {createLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Creazione...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Crea Utente</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>


            {/* Right Column: Contacts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Search Bar Panel */}
              <div className="glass-panel" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div className="input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
                  <Search className="input-icon" size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Cerca per nome o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '10px 14px 10px 42px' }}
                  />
                </div>
                
                {/* Sort Option Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Ordina per:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="form-input"
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      height: '36px',
                      width: 'auto'
                    }}
                  >
                    <option value="name" style={{ background: '#1c1e2b' }}>Nome</option>
                    <option value="latestConsultation" style={{ background: '#1c1e2b' }}>Ultima Consulenza</option>
                  </select>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Trovati: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredContacts.length}</span>
                </div>
              </div>

              {/* Contacts Grid/List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="glass-panel animate-slide"
                      onClick={() => setExpandedContactId(expandedContactId === contact.id ? null : contact.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Header Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {/* Avatar */}
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: getAvatarGradient(contact.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            userSelect: 'none'
                          }}>
                            {getInitials(contact.name)}
                          </div>

                          {/* Name and Email */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                                {contact.name}
                              </span>
                              {contact.consultations && contact.consultations.length > 0 && (
                                <span style={{
                                  fontSize: '11px',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  border: '1px solid rgba(99, 102, 241, 0.25)',
                                  color: 'var(--primary)',
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600
                                }}>
                                  <Calendar size={10} />
                                  <span>{contact.consultations.length}</span>
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {contact.email}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyEmail(contact.email, contact.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: copiedId === contact.id ? 'var(--success)' : 'var(--text-muted)',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'color 0.2s ease'
                                }}
                                title="Copia email"
                              >
                                {copiedId === contact.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.id);
                          }}
                          className="btn btn-secondary"
                          disabled={deletingIds.has(contact.id)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.04)',
                            borderColor: 'rgba(239, 68, 68, 0.15)',
                            color: 'rgba(248, 113, 113, 0.85)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.color = 'rgba(248, 113, 113, 0.85)';
                          }}
                        >
                          {deletingIds.has(contact.id) ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      {/* Consultations Sub-Panel (Expanded) */}
                      {expandedContactId === contact.id && (
                        <div 
                          style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            width: '100%'
                          }}
                          onClick={(e) => e.stopPropagation()} // Stop propagation from closing the card
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarDays size={14} style={{ color: 'var(--primary)' }} />
                            <span>Consulenze Eseguite</span>
                          </div>

                          {/* List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {contact.consultations && contact.consultations.length > 0 ? (
                              contact.consultations.map((con) => {
                                const rawDate = con.consultation_date.split('T')[0];
                                const [y, m, d] = rawDate.split('-');
                                const formattedDate = `${d}/${m}/${y}`;
                                
                                return (
                                  <div 
                                    key={con.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: 'rgba(255, 255, 255, 0.01)',
                                      border: '1px solid var(--border-color)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formattedDate}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteConsultation(contact.id, con.id)}
                                      disabled={deletingConsultationIds.has(con.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'rgba(248, 113, 113, 0.7)',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'color 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(248, 113, 113, 0.7)'}
                                      title="Elimina consulenza"
                                    >
                                      {deletingConsultationIds.has(con.id) ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={12} />
                                      )}
                                    </button>
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{
                                padding: '12px',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px dashed var(--border-color)',
                                borderRadius: '6px'
                              }}>
                                Nessuna consulenza registrata
                              </div>
                            )}
                          </div>

                          {/* Add Form */}
                          <form 
                            onSubmit={(e) => handleAddConsultation(contact.id, e)}
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '4px'
                            }}
                          >
                            <div style={{ flex: 1, height: '32px' }} className="input-wrapper">
                              <Calendar size={14} className="input-icon" />
                              <input
                                type="date"
                                className="form-input"
                                required
                                disabled={addingConsultationIds.has(contact.id)}
                                value={consultationDates[contact.id] || ''}
                                onChange={(e) => setConsultationDates({ ...consultationDates, [contact.id]: e.target.value })}
                                style={{
                                  padding: '6px 8px 6px 36px',
                                  fontSize: '12px',
                                  height: '32px'
                                }}
                              />
                            </div>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={addingConsultationIds.has(contact.id) || !consultationDates[contact.id]}
                              style={{
                                padding: '0 12px',
                                height: '32px',
                                fontSize: '12px',
                                borderRadius: '8px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {addingConsultationIds.has(contact.id) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                'Aggiungi'
                              )}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))

                ) : (
                  <div className="glass-panel" style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <Users size={40} style={{ strokeWidth: 1.5, opacity: 0.4 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      {searchQuery ? 'Nessun contatto corrisponde alla ricerca' : 'Nessun contatto in rubrica'}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Global responsive custom CSS rules */}
        <style jsx global>{`
          @media (max-width: 768px) {
            .dashboard-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
