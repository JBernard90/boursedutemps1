import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function POST(req: Request) {
  const { email, phone, emailCode, phoneCode } = await req.json();

  try {
    const emailResult = await query(
      'SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()',
      [email, emailCode]
    );
    
    const phoneResult = await query(
      'SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()',
      [phone, phoneCode]
    );

    if ((emailResult.rowCount ?? 0) > 0 && (phoneResult.rowCount ?? 0) > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Codes invalides ou expirés' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error checking verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
