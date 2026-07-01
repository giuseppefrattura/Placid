import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query, initDb } from '@/lib/db';
import { hashPassword } from '@/lib/password';

// POST /api/users - Creates a new user (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !username.trim() || !password || !password.trim()) {
      return NextResponse.json(
        { error: 'Username e password sono campi obbligatori' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'L\'username deve avere almeno 3 caratteri' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'La password deve avere almeno 6 caratteri' },
        { status: 400 }
      );
    }

    await initDb();

    // 2. Check if username matches the static admin username
    const adminUser = process.env.USER1_USERNAME || 'admin';
    if (cleanUsername.toLowerCase() === adminUser.toLowerCase()) {
      return NextResponse.json(
        { error: 'Questo username è riservato' },
        { status: 409 }
      );
    }

    // 3. Check if username already exists in database
    const checkResult = await query(
      'SELECT * FROM users WHERE username = $1',
      [cleanUsername]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Questo username è già registrato' },
        { status: 409 }
      );
    }

    // 4. Hash the password and insert the new user
    const passwordHash = hashPassword(cleanPassword);
    
    const insertQuery = `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, created_at
    `;
    
    const result = await query(insertQuery, [cleanUsername, passwordHash]);
    
    return NextResponse.json(
      { success: true, user: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Impossibile creare l\'utente' },
      { status: 500 }
    );
  }
}
