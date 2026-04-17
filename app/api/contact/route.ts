import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendContactConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { fullName, name: _name, email, whatsapp, organization, subject, message } = await req.json();
    const name = fullName || _name || '';

    // Enregistrer dans Supabase si configuré
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from('contact_requests').insert({ full_name: name, email, whatsapp: whatsapp || null, organization: organization || null, subject: subject || '', message });
      if (error) {
        console.error(error);
        return NextResponse.json(
          { error: 'Erreur lors de la sauvegarde du message.' },
          { status: 500 }
        );
      }
    }

    // Envoyer un email de confirmation
    await sendContactConfirmationEmail(name, email);

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
