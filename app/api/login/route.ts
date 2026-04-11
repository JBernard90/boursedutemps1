import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect.", success: false }, { status: 401 });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect.", success: false }, { status: 401 });
    }

    const token = jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, token, user: userWithoutPassword });
  } catch (error: any) {
    console.error('[Login] Error:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
