import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query, initDb } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';

// POST /api/users/change-password - Changes password for the currently logged-in user (excludes static admin)
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getSessionUser();
    if (!session || !session.username) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !currentPassword.trim() || !newPassword || !newPassword.trim()) {
      return NextResponse.json(
        { error: 'Password attuale e nuova password sono richieste' },
        { status: 400 }
      );
    }

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();

    if (cleanNew.length < 6) {
      return NextResponse.json(
        { error: 'La nuova password deve avere almeno 6 caratteri' },
        { status: 400 }
      );
    }

    // 2. Prevent static admin from changing password via DB
    const adminUser = process.env.USER1_USERNAME || 'admin';
    if (session.username.toLowerCase() === adminUser.toLowerCase()) {
      return NextResponse.json(
        { error: 'La password dell\'utente admin è configurata staticamente nel file .env.local e non può essere modificata da qui' },
        { status: 400 }
      );
    }

    await initDb();

    // 3. Query the user record
    const userResult = await query(
      'SELECT * FROM users WHERE username = $1',
      [session.username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const dbUser = userResult.rows[0];

    // 4. Verify current password
    const isPasswordCorrect = verifyPassword(cleanCurrent, dbUser.password_hash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'La password attuale inserita non è corretta' },
        { status: 401 }
      );
    }

    // 5. Hash new password and update
    const newPasswordHash = hashPassword(cleanNew);
    await query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [newPasswordHash, session.username]
    );

    return NextResponse.json({ success: true, message: 'Password aggiornata con successo!' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare la password' },
      { status: 500 }
    );
  }
}
