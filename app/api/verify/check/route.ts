import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function POST(req: Request) {
  const { email, emailCode } = await req.json();

  try {
    const emailResult = await query(
      'SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()',
      [email, emailCode]
    );

    if ((emailResult.rowCount ?? 0) > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error checking verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
