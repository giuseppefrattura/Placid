import { NextRequest, NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    
    // Await params because Next.js 15+ has asynchronous route params
    const { id } = await params;

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json(
        { error: 'ID del contatto non valido o non fornito' },
        { status: 400 }
      );
    }

    const deleteQuery = 'DELETE FROM contacts WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [parseInt(id, 10)]);

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, contact: result.rows[0] });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare il contatto dal database' },
      { status: 500 }
    );
  }
}
