import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function POST(req: Request) {
  const { email } = await req.json();

  const code = '123456'; // MOCK
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    // Supprimer anciens codes
    await query('DELETE FROM otps WHERE identifier = $1', [email]);

    // Insérer nouveau code
    await query(
      'INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    console.log(`[MOCK VERIFY] Code for ${email}: ${code}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error initializing verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
