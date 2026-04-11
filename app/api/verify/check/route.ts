import { NextResponse } from 'next/server';
import { query } from '../../../../db';

export async function POST(request: Request) {
  try {
    const { email, phone, emailCode, phoneCode } = await request.json();
    
    const emailResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`email:${email}`]);
    const phoneResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`phone:${phone}`]);

    const storedEmail = emailResult.rows[0];
    const storedPhone = phoneResult.rows[0];

    if (!storedEmail || storedEmail.code !== emailCode || new Date() > new Date(storedEmail.expires_at)) {
      return NextResponse.json({ error: "Code email invalide ou expiré.", success: false }, { status: 400 });
    }
    if (!storedPhone || storedPhone.code !== phoneCode || new Date() > new Date(storedPhone.expires_at)) {
      return NextResponse.json({ error: "Code SMS invalide ou expiré.", success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Verify Check] Error:', error);
    return NextResponse.json({ error: "Erreur lors de la vérification des codes.", success: false }, { status: 500 });
  }
}
