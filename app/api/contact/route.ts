import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendContactConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { fullName, name: _name, email, whatsapp, organization, subject, message } = await req.json();
    const name = fullName || _name || '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nom, email et message sont obligatoires.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // Créer la table si elle n'existe pas
      await supabase.rpc('exec_sql', {
        sql: `CREATE TABLE IF NOT EXISTS contact_requests (
          id SERIAL PRIMARY KEY,
          full_name TEXT,
          email TEXT NOT NULL,
          whatsapp TEXT,
          organization TEXT,
          subject TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      }).catch(() => {}); // ignore si rpc non dispo

      const { error } = await supabase
        .from('contact_requests')
        .insert({ full_name: name, email, whatsapp: whatsapp || null, organization: organization || null, subject: subject || '', message });

      if (error) {
        console.error('Supabase insert error:', error.message, error.details);
        // Ne pas bloquer si la table n'existe pas encore — on continue quand même
        if (!error.message.includes('does not exist')) {
          return NextResponse.json({ error: 'Erreur lors de la sauvegarde du message.' }, { status: 500 });
        }
      }
    }

    // Envoyer email de confirmation
    try {
      await sendContactConfirmationEmail(name, email);
    } catch (emailErr) {
      console.error('Email error (non-blocking):', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès.' }, { status: 200 });
  } catch (e) {
    console.error('Contact route error:', e);
    return NextResponse.json({ error: 'Erreur interne serveur.' }, { status: 500 });
  }
}