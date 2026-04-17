import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // autorise la création d'utilisateur via OTP
      },
    });

    if (error) {
      console.error('OTP init error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Server error:', e);
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 });
  }
}
