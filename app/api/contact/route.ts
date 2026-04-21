import { NextResponse } from 'next/server';
import { query } from '@/db';
import { sendContactConfirmationEmail, sendContactNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { fullName, name: _name, email, whatsapp, organization, subject, message } = await req.json();
    const name = fullName || _name || '';

    if (!email || !message) {
      return NextResponse.json({ error: 'Email et message requis.' }, { status: 400 });
    }

    // 1. Sauvegarder dans PostgreSQL
    await query(
      `INSERT INTO contact_requests (full_name, email, whatsapp, organization, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, whatsapp || null, organization || null, subject || '', message]
    );

    // 2. Accuse de reception a l expediteur
    await sendContactConfirmationEmail(name, email, subject || 'Votre message');

    // 3. Notification a l admin
    await sendContactNotificationEmail(name, email, whatsapp || '', organization || '', subject || '', message);

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (e: any) {
    console.error('Contact error:', e);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde du message.' }, { status: 500 });
  }
}
