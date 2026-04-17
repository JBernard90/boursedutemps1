import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      department,
      gender,
      country,
      whatsapp,
      offeredSkills,
      requestedSkills,
      availability,
      languages,
      avatar,
    } = body;

    // ───────────────────────────────────────────────
    // 1) Créer l'utilisateur dans Supabase Auth
    // ───────────────────────────────────────────────
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // car OTP déjà validé
    });

    if (authError) {
      console.error(authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // ───────────────────────────────────────────────
    // 2) Insérer le profil dans la table "profiles"
    // ───────────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        department,
        gender,
        country,
        whatsapp,
        offered_skills: offeredSkills,
        requested_skills: requestedSkills,
        availability,
        languages,
        avatar,
      });

    if (profileError) {
      console.error(profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // ───────────────────────────────────────────────
    // 3) Retourner l'utilisateur au frontend
    // ───────────────────────────────────────────────
    return NextResponse.json(
      {
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          avatar,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 });
  }
}
