import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import { query } from '../../../../db';

const generateSecureOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendSMS = async (to: string, message: string) => {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_SENDER_ID;
  
  if (!apiKey || !deviceId) {
    console.error('[TextBee] Missing API Key or Device ID');
    return false;
  }

  try {
    const response = await fetch('https://api.textbee.dev/api/v1/gateway/devices/send-sms', {
      method: 'POST',
      headers: { 
        'x-api-key': apiKey, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        receiver: to, 
        message: message, 
        deviceId: deviceId 
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[TextBee] SMS Error:', error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();
    
    if (!email || !email.endsWith('@etu-usenghor.org')) {
      return NextResponse.json({ error: "Email invalide ou domaine non autorisé.", success: false }, { status: 400 });
    }
    if (!phone || !/^\+[1-9]\d{1,14}$/.test(phone)) {
      return NextResponse.json({ error: "Format de téléphone invalide. Utilisez le format international (ex: +221...)", success: false }, { status: 400 });
    }

    const emailOtp = generateSecureOTP();
    const phoneOtp = generateSecureOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query('DELETE FROM otps WHERE identifier = $1 OR identifier = $2', [`email:${email}`, `phone:${phone}`]);
    await query('INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)', [`email:${email}`, emailOtp, expiresAt]);
    await query('INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)', [`phone:${phone}`, phoneOtp, expiresAt]);

    // Send Email
    transporter.sendMail({
      from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Code de sécurité - Inscription',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Vérification de votre adresse email</h2>
          <p>Vous avez demandé à vous inscrire sur la Bourse du Temps.</p>
          <p>Voici votre code de sécurité à 6 chiffres (valable 10 minutes) :</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 32px; letter-spacing: 4px; color: #1f2937;">${emailOtp}</strong>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      `,
    }).catch((err: any) => console.error('[Verify Init] Email error:', err.message));

    // Send SMS
    sendSMS(phone, `Bourse du Temps: Votre code de sécurité est ${phoneOtp}. Valable 10 min.`)
      .catch((err: any) => console.error('[Verify Init] SMS error:', err.message));

    return NextResponse.json({ success: true, message: "Codes générés." });
  } catch (error: any) {
    console.error('[Verify Init] Error:', error);
    return NextResponse.json({ error: "Erreur lors de la génération des codes.", success: false }, { status: 500 });
  }
}
