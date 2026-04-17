import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOtpEmail } from '@/lib/email';

// Client Supabase côté serveur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Enregistrer dans Supabase
    const { error } = await supabase.from('contact_requests').insert({
      name,
      email,
      message,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du message.' },
        { status: 500 }
      );
    }

    // Envoyer l’email de confirmation
    await sendOtpEmail({
      to: email,
      subject: 'Votre message a bien été reçu',
      text: `Bonjour ${name},\n\nNous avons bien reçu votre message :\n"${message}"\n\nNous vous répondrons dès que possible.`,
    });

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès.' },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Erreur interne serveur.' },
      { status: 500 }
    );
  }
}
