import { NextResponse } from 'next/server';
import { query } from '@/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const data = await req.json();
  const { email, emailCode, password, firstName, lastName, department, gender, country, whatsapp, offeredSkills, requestedSkills, availability, languages, avatar } = data;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  try {
    // 1. Vérifier l'OTP si fourni
    if (emailCode) {
      const otpResult = await query(
        'SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()',
        [email, emailCode]
      );
      if (!otpResult.rowCount || otpResult.rowCount === 0) {
        return NextResponse.json({ error: 'Code de vérification invalide ou expiré.' }, { status: 401 });
      }
    }

    // 2. Vérifier si email existe déjà
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if ((existing.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // 3. Créer le compte
    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = uuidv4();
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    await query(
      `INSERT INTO users (
        uid, email, password, first_name, last_name, whatsapp, department, gender, country,
        availability, languages, offered_skills, requested_skills, avatar, terms_accepted, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        uid, email, hashedPassword, firstName, lastName, whatsapp, department,
        gender, country, availability, JSON.stringify(languages || []),
        JSON.stringify(offeredSkills || []), JSON.stringify(requestedSkills || []),
        avatar, true, role
      ]
    );

    // 4. Supprimer l'OTP utilisé
    if (emailCode) {
      await query('DELETE FROM otps WHERE identifier = $1', [email]);
    }

    // 5. Générer token et retourner l'utilisateur
    const token = signToken({ uid, email });

    const userResult = await query('SELECT * FROM users WHERE uid = $1', [uid]);
    const user = userResult.rows[0];
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

  } catch (e: any) {
    console.error('Profil registration error:', e);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
