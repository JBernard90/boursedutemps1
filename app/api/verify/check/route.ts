import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: code,
      type: 'email', // IMPORTANT : correspond à signInWithOtp
    });

    if (error) {
      console.error('OTP verify error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (e: any) {
    console.error('Server error:', e);
    return NextResponse.json(
      { error: 'Erreur interne serveur' },
      { status: 500 }
    );
  }
}
