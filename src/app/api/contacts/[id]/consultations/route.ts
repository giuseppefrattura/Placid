import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query, initDb } from '@/lib/db';

// POST /api/contacts/[id]/consultations - Adds a consultation date for a specific contact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const contactId = parseInt(id, 10);

    if (!contactId || isNaN(contactId)) {
      return NextResponse.json(
        { error: 'ID contatto non valido' },
        { status: 400 }
      );
    }

    const { consultationDate } = await request.json();

    if (!consultationDate || !consultationDate.trim()) {
      return NextResponse.json(
        { error: 'La data della consulenza è obbligatoria' },
        { status: 400 }
      );
    }

    // Verify date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(consultationDate)) {
      return NextResponse.json(
        { error: 'Formato data non valido. Usa il formato AAAA-MM-GG' },
        { status: 400 }
      );
    }

    await initDb();

    // Verify contact exists
    const contactCheck = await query('SELECT id FROM contacts WHERE id = $1', [contactId]);
    if (contactCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    // Insert consultation
    const insertQuery = `
      INSERT INTO consultations (contact_id, consultation_date)
      VALUES ($1, $2)
      RETURNING id, contact_id, consultation_date
    `;
    const result = await query(insertQuery, [contactId, consultationDate]);

    return NextResponse.json(
      { success: true, consultation: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding consultation:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiungere la consulenza' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id]/consultations - Removes a specific consultation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const contactId = parseInt(id, 10);

    const { searchParams } = request.nextUrl;
    const consultationId = parseInt(searchParams.get('consultationId') || '', 10);

    if (!contactId || isNaN(contactId) || !consultationId || isNaN(consultationId)) {
      return NextResponse.json(
        { error: 'Parametri ID non validi' },
        { status: 400 }
      );
    }

    await initDb();

    // Delete consultation
    const deleteQuery = `
      DELETE FROM consultations
      WHERE id = $1 AND contact_id = $2
      RETURNING *
    `;
    const result = await query(deleteQuery, [consultationId, contactId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Consulenza non trovata per questo contatto' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, consultation: result.rows[0] });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare la consulenza' },
      { status: 500 }
    );
  }
}
