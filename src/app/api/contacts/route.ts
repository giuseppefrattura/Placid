import { NextRequest, NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';

// GET /api/contacts - Retrieves all contacts sorted by name
export async function GET() {
  try {
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
    return NextResponse.json({ contacts: result.rows });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Impossibile caricare la lista dei contatti' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Adds a new contact
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const { name, email } = await request.json();

    if (!name || !name.trim() || !email || !email.trim()) {
      return NextResponse.json(
        { error: 'Nome ed email sono campi obbligatori' },
        { status: 400 }
      );
    }

    // Basic email format verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Formato indirizzo email non valido' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    // Query template for inserting database contacts
    const insertQuery = 'INSERT INTO contacts (name, email) VALUES ($1, $2) RETURNING *';
    const result = await query(insertQuery, [cleanName, cleanEmail]);
    
    return NextResponse.json({ 
      success: true, 
      contact: { ...result.rows[0], consultations: [] } 
    });
  } catch (error: any) {
    console.error('Error adding contact:', error);
    
    // Check for standard unique constraint violation (PostgreSQL code 23505)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Questo indirizzo email è già registrato nei contatti' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Impossibile salvare il contatto nel database' },
      { status: 500 }
    );
  }
}
