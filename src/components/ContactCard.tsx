import React, { useState } from 'react';
import { Calendar, Copy, Check, Loader2, Trash2, CalendarDays, Plus } from 'lucide-react';
import { Contact, getInitials, getAvatarGradient } from '@/lib/contact-utils';

interface ContactCardProps {
  contact: Contact;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteContact: (id: number) => Promise<void>;
  onAddConsultation: (contactId: number, date: string) => Promise<void>;
  onDeleteConsultation: (contactId: number, consultationId: number) => Promise<void>;
  isDeleting: boolean;
  isDeletingConsultation: (id: number) => boolean;
  isAddingConsultation: boolean;
}

export default function ContactCard({
  contact,
  isExpanded,
  onToggleExpand,
  onDeleteContact,
  onAddConsultation,
  onDeleteConsultation,
  isDeleting,
  isDeletingConsultation,
  isAddingConsultation
}: ContactCardProps) {
  const [copied, setCopied] = useState(false);
  const [consultationDate, setConsultationDate] = useState('');

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteContact(contact.id);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationDate) return;
    onAddConsultation(contact.id, consultationDate).then(() => {
      setConsultationDate('');
    });
  };

  return (
    <div
      className="glass-panel animate-slide"
      onClick={onToggleExpand}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: getAvatarGradient(contact.name),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', userSelect: 'none'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '11px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: 'var(--primary)', padding: '1px 6px', borderRadius: '6px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600
                  }}>
                    <Calendar size={10} />
                    <span>{contact.consultations.length}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    Ultima: {(() => {
                      const rawDate = contact.consultations[0].consultation_date.split('T')[0];
                      const [y, m, d] = rawDate.split('-');
                      return `${d}/${m}/${y}`;
                    })()}
                  </span>
                </div>
              )}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {contact.email}
              <button
                onClick={handleCopyEmail}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: copied ? 'var(--success)' : 'var(--text-muted)',
                  padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease'
                }}
                title="Copia email"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleDelete}
          className="btn btn-secondary"
          disabled={isDeleting}
          style={{
            padding: '10px', borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.15)',
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
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      {/* Consultations Sub-Panel (Expanded) */}
      {isExpanded && (
        <div
          style={{
            marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '12px', width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={14} style={{ color: 'var(--primary)' }} />
            <span>Consulenze Eseguite</span>
          </div>

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
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)',
                      padding: '8px 12px', borderRadius: '6px', fontSize: '12px'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formattedDate}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteConsultation(contact.id, con.id)}
                      disabled={isDeletingConsultation(con.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(248, 113, 113, 0.7)', padding: '2px', display: 'flex',
                        alignItems: 'center', transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(248, 113, 113, 0.7)'}
                      title="Elimina consulenza"
                    >
                      {isDeletingConsultation(con.id) ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                Nessuna consulenza eseguita
              </div>
            )}
          </div>

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="date"
              className="form-input"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              disabled={isAddingConsultation}
              required
              style={{
                flex: 1, padding: '8px 12px', fontSize: '12px', borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isAddingConsultation || !consultationDate}
              style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isAddingConsultation ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>Aggiungi</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
