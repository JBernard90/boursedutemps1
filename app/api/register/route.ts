import { NextResponse } from 'next/server';
import { query, initDB } from '@/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  await initDB();
  const data = await req.json();

  // Basic validation
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Check if user exists
  const existing = await query('SELECT * FROM users WHERE email = $1', [data.email]);
  if (existing.rowCount! > 0) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const uid = uuidv4();

  try {
    await query(
      `INSERT INTO users (
        uid, email, password, first_name, last_name, whatsapp, department, gender, country, 
        availability, languages, offered_skills, requested_skills, avatar, terms_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        uid, data.email, hashedPassword, data.firstName, data.lastName, data.phone, data.department, 
        data.gender, data.country, data.availability, JSON.stringify(data.languages), 
        JSON.stringify(data.offeredSkills), JSON.stringify(data.requestedSkills), data.avatar, true
      ]
    );

    const token = signToken({ uid, email: data.email });
    return NextResponse.json({ token, uid });
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 });
  }
}
