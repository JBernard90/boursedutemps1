import { NextResponse } from 'next/server';
import { query } from '@/db';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const code = crypto.randomInt(100000, 999999).toString();
  
  try {
    // Supprimer anciens codes
    await query('DELETE FROM otps WHERE identifier = $1', [email]);
    
    // ✅ Syntaxe PostgreSQL correcte - interval hardcodé, pas paramétré
    await query(
      "INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [email, code]
    );

    // Envoyer email
    await sendOtpEmail(email, code);
    console.log(`📧 OTP généré pour ${email}: ${code}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}