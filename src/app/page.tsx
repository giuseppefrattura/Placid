import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query, initDb } from '@/lib/db';
import DashboardClient from './DashboardClient';

// Fallback mock contacts list to show if the database is unreachable
const MOCK_CONTACTS = [
  {
    id: 1001,
    name: 'Alessandro Neri',
    email: 'alessandro.neri@esempio.com',
    followup_mail_sent: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 1002,
    name: 'Giuseppe Frattura',
    email: 'giuseppe.frattura@esempio.com',
    followup_mail_sent: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 1003,
    name: 'Maria Rossi',
    email: 'maria.rossi@esempio.com',
    followup_mail_sent: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 1004,
    name: 'Sofia Bianchi',
    email: 'sofia.bianchi@esempio.com',
    followup_mail_sent: false,
    created_at: new Date().toISOString(),
  },
];

export default async function DashboardPage() {
  // Check auth session
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  let contacts = [];
  let dbError = false;

  try {
    // Attempt database migration and fetch
    await initDb();
    const result = await query(`
      SELECT c.*, 
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT('id', con.id, 'consultation_date', con.consultation_date) 
                 ORDER BY con.consultation_date DESC
               ) FILTER (WHERE con.id IS NOT NULL), 
               '[]'
             ) AS consultations
      FROM contacts c
      LEFT JOIN consultations con ON c.id = con.contact_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    contacts = result.rows;

  } catch (error) {
    console.error('Remote database connection failed on render. Falling back to local contacts mock:', error);
    dbError = true;
    contacts = MOCK_CONTACTS;
  }

  return (
    <DashboardClient 
      initialContacts={contacts} 
      username={user.username} 
      dbError={dbError} 
    />
  );
}
