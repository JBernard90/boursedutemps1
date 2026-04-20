import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, organization, subject, message } = body;

    // 1. Validation de base
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // 2. Enregistrement dans Supabase (si configuré)
    if (supabase) {
      const { error: dbError } = await supabase
        .from('contact_requests')
        .insert([
          {
            full_name: fullName,
            email: email,
            whatsapp: whatsapp,
            organization: organization,
            subject: subject,
            message: message,
            status: 'pending'
          }
        ]);
      
      if (dbError) {
        console.error('Erreur Supabase:', dbError);
        // On continue quand même pour l'envoi d'email si l'insertion échoue? 
        // Généralement oui, mais on log l'erreur.
      }
    }

    // 3. Email à l'administrateur
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
