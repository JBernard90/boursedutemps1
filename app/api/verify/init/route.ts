import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  // Générer code 6 chiffres
  const code = crypto.randomInt(100000, 999999).toString();
  
  try {
    // Supprimer anciens codes pour cet email
    await query('DELETE FROM otps WHERE identifier = $1', [email]);
    
    // Insérer nouveau code (valide 10 minutes)
    await query(
      `INSERT INTO otps (identifier, code, expires_at) 
       VALUES ($1, $2, NOW() + interval '10 minutes')`,
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
