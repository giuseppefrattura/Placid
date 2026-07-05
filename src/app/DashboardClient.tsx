'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, LogOut, Database, Users, Mail, Copy, X } from 'lucide-react';
import { Contact, filterContacts, sortContacts, ConsultationFilter, SortBy } from '@/lib/contact-utils';
import ContactCard from '@/components/ContactCard';

interface DashboardClientProps {
  initialContacts: Contact[];
  username: string;
  dbError: boolean;
}

export default function DashboardClient({ 
  initialContacts, 
  username, 
  dbError 
}: DashboardClientProps) {
  const router = useRouter();
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [consultationFilter, setConsultationFilter] = useState<ConsultationFilter>('all');
  const [inactiveMonths, setInactiveMonths] = useState<number>(3);
  const [showEmailsModal, setShowEmailsModal] = useState(false);

  // UI interactive states
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  
  // Expanded contact for consultations
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null);
  const [addingConsultationIds, setAddingConsultationIds] = useState<Set<number>>(new Set());
  const [deletingConsultationIds, setDeletingConsultationIds] = useState<Set<number>>(new Set());

  // Create consultation handler
  const handleAddConsultation = async (contactId: number, date: string) => {
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
                (a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
              );
              return { ...c, consultations: updatedConsultations };
            }
            return c;
          })
        );
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

  // Delete contact handler
  const handleDeleteContact = async (id: number) => {
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
      alert("Errore di rete durante l'eliminazione.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Filter and sort contacts using extracted pure functions
  const filteredContacts = sortContacts(
    filterContacts(contacts, searchQuery, consultationFilter, inactiveMonths),
    sortBy
  );

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

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => router.push('/contacts/new')} className="btn btn-primary" style={{
                padding: '8px 14px',
                fontSize: '13px',
                borderRadius: '8px',
                gap: '6px'
              }}>
                <Plus size={14} />
                <span>Nuovo Contatto</span>
              </button>
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
          {/* List Layout */}
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
              
              {/* Consultation Filter Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Consulenze:</span>
                <select
                  value={consultationFilter}
                  onChange={(e) => setConsultationFilter(e.target.value as ConsultationFilter)}
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
                  <option value="all" style={{ background: '#1c1e2b' }}>Tutti</option>
                  <option value="hasSome" style={{ background: '#1c1e2b' }}>Almeno una</option>
                  <option value="none" style={{ background: '#1c1e2b' }}>Nessuna</option>
                  <option value="inactive" style={{ background: '#1c1e2b' }}>Inattivi da X mesi</option>
                </select>
              </div>

              {/* Inactive Months Input */}
              {consultationFilter === 'inactive' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Mesi:</span>
                  <input
                    type="number"
                    min="1"
                    value={inactiveMonths}
                    onChange={(e) => setInactiveMonths(parseInt(e.target.value) || 1)}
                    className="form-input"
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      height: '36px',
                      width: '60px'
                    }}
                  />
                </div>
              )}

              {/* Sort Option Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Ordina per:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Trovati: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredContacts.length}</span>
                </div>
                <button 
                  onClick={() => setShowEmailsModal(true)}
                  className="btn btn-secondary" 
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '13px', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={14} />
                  Esporta Email
                </button>
              </div>
            </div>

            {/* Contacts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isExpanded={expandedContactId === contact.id}
                    onToggleExpand={() => setExpandedContactId(expandedContactId === contact.id ? null : contact.id)}
                    onDeleteContact={handleDeleteContact}
                    onAddConsultation={handleAddConsultation}
                    onDeleteConsultation={handleDeleteConsultation}
                    isDeleting={deletingIds.has(contact.id)}
                    isDeletingConsultation={(id) => deletingConsultationIds.has(id)}
                    isAddingConsultation={addingConsultationIds.has(contact.id)}
                  />
                ))
              ) : (
                <div style={{
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
      </main>

      {/* Emails Modal */}
      {showEmailsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Mail size={18} style={{ color: 'var(--primary)' }} />
                Email dei Contatti
              </h3>
              <button 
                onClick={() => setShowEmailsModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Copia la lista delle email (separate da virgola) per usarle nel tuo client di posta.
            </p>
            <textarea
              readOnly
              value={filteredContacts.map(c => c.email).join(', ')}
              className="form-input"
              style={{
                width: '100%',
                height: '150px',
                resize: 'none',
                fontFamily: 'monospace',
                fontSize: '13px',
                padding: '12px',
                lineHeight: '1.5'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setShowEmailsModal(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}
              >
                Chiudi
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(filteredContacts.map(c => c.email).join(', '));
                  alert('Email copiate negli appunti!');
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <Copy size={16} />
                Copia Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
