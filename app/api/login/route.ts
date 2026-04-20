import { NextResponse } from 'next/server';
import { query, initDB } from '@/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const token = signToken({ uid: user.uid, email: user.email });

    const camelUser = {
      id: user.uid,
      uid: user.uid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      department: user.department,
      whatsapp: user.whatsapp,
      gender: user.gender,
      country: user.country,
      bio: user.bio,
      offeredSkills: user.offered_skills || [],
      requestedSkills: user.requested_skills || [],
      availability: user.availability,
      languages: user.languages || [],
      credits: user.credits,
      avatar: user.avatar,
      coverPhoto: user.cover_photo,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    };

    return NextResponse.json({ token, user: camelUser });
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ error: `Erreur serveur: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
