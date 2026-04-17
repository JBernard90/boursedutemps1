import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// Client serveur pour Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, organization, subject, message } = body;

    // 1. Validation de base
    if (!fullName || !email || !whatsapp || !organization || !subject || !message) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
    }

    // 2. Email à l'administrateur
    const adminEmail = "jeanbernardpierrelouis@gmail.com";
    await sendEmail({
      to: adminEmail,
      subject: `Nouveau contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2563eb;">Nouvelle demande de contact</h2>
          <p><strong>Nom:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
          <p><strong>Organisation:</strong> ${organization || 'N/A'}</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `
    });

    // 3. Sauvegarde dans Supabase (optionnel - désactivé si on ne veut plus de doublons mais l'utilisateur veut garder supabase)
    // On le remet puisque l'utilisateur veut "garder supabase"
    try {
      await supabase.from('contact_requests').insert([{
        full_name: fullName,
        email,
        whatsapp,
        organization,
        subject,
        message,
        created_at: new Date().toISOString()
      }]);
    } catch (dbError) {
      console.error('Erreur Supabase Contact:', dbError);
      // On ne bloque pas la réponse si c'est juste l'insertion qui échoue
    }

    // 4. Email de confirmation à l'utilisateur
    await sendEmail({
      to: email,
      subject: 'Confirmation de votre message - Bourse du Temps',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2563eb;">Merci de nous avoir contactés</h2>
          <p>Bonjour ${fullName},</p>
          <p>Nous avons bien reçu votre message concernant : <strong>${subject}</strong>.</p>
          <p>Notre équipe va l'étudier et reviendra vers vous dès que possible.</p>
          <br />
          <p>Cordialement,<br />L'équipe Bourse du Temps</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Contact:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}
