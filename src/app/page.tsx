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
    created_at: new Date().toISOString(),
  },
  {
    id: 1002,
    name: 'Giuseppe Frattura',
    email: 'giuseppe.frattura@esempio.com',
    created_at: new Date().toISOString(),
  },
  {
    id: 1003,
    name: 'Maria Rossi',
    email: 'maria.rossi@esempio.com',
    created_at: new Date().toISOString(),
  },
  {
    id: 1004,
    name: 'Sofia Bianchi',
    email: 'sofia.bianchi@esempio.com',
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
    const result = await query('SELECT * FROM contacts ORDER BY name ASC');
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
