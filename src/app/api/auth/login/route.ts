import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signJWT, COOKIE_NAME } from '@/lib/auth';
import { query, initDb } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password sono richiesti' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const u1Name = process.env.USER1_USERNAME || 'admin';
    const u1Pass = process.env.USER1_PASSWORD || 'admin';

    let isValidUser = false;

    // 1. Check if the user is the static admin
    if (trimmedUsername === u1Name) {
      isValidUser = trimmedPassword === u1Pass;
    } else {
      // 2. Check if the user exists in the database
      await initDb();
      const userResult = await query(
        'SELECT * FROM users WHERE username = $1',
        [trimmedUsername]
      );
      
      if (userResult.rows.length > 0) {
        const dbUser = userResult.rows[0];
        isValidUser = verifyPassword(trimmedPassword, dbUser.password_hash);
      }
    }

    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Username o password non validi' },
        { status: 401 }
      );
    }

    // Sign session token (valid for 7 days)
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const token = await signJWT({ username: trimmedUsername, exp });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return NextResponse.json({ success: true, user: { username: trimmedUsername } });
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

