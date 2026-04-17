import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function POST(req: Request) {
  const { email, emailCode } = await req.json();

  if (!email || !emailCode) {
    return NextResponse.json({ error: 'Email et code requis' }, { status: 400 });
  }

  try {
    const result = await query(
      'SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()',
      [email, emailCode]
    );

    if (result.rowCount && result.rowCount > 0) {
      // On garde l'OTP en base pour que login/register puissent le vérifier aussi
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error checking verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}