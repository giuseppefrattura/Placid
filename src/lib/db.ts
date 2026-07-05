import { Pool } from 'pg';

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
});

// Helper to execute SQL queries
export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

let isInitialized = false;

// Ensure database schema is present
export async function initDb() {
  if (isInitialized) return;

  const createContactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      followup_mail_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createConsultationsTable = `
    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      consultation_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await query(createContactsTable);
    await query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS followup_mail_sent BOOLEAN DEFAULT FALSE;`);
    await query(createUsersTable);
    await query(createConsultationsTable);
    isInitialized = true;
    console.log('Database schema verified: contacts, users, and consultations tables are ready.');
  } catch (error) {
    console.error('Database schema verification failed:', error);
    throw error;
  }
}


