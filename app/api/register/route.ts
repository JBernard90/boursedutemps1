import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, emailCode, phoneCode, password, firstName, lastName, campus, department, gender, country, offeredSkills, requestedSkills, availability, languages, avatar } = body;
    
    // 1. Verify OTPs again
    const emailResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`email:${email}`]);
    const phoneResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`phone:${phone}`]);

    const storedEmail = emailResult.rows[0];
    const storedPhone = phoneResult.rows[0];

    if (!storedEmail || storedEmail.code !== emailCode || new Date() > new Date(storedEmail.expires_at)) {
      return NextResponse.json({ error: "Échec de sécurité : Code email invalide ou expiré.", success: false }, { status: 403 });
    }
    if (!storedPhone || storedPhone.code !== phoneCode || new Date() > new Date(storedPhone.expires_at)) {
      return NextResponse.json({ error: "Échec de sécurité : Code SMS invalide ou expiré.", success: false }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Cet email est déjà utilisé.", success: false }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await query(
      `INSERT INTO users (uid, email, password, first_name, last_name, whatsapp, campus, department, gender, country, offered_skills, requested_skills, availability, languages, avatar, verified, is_verified_email, is_verified_sms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, true, true)`,
      [uid, email, hashedPassword, firstName, lastName, phone, campus, department, gender, country, JSON.stringify(offeredSkills || []), JSON.stringify(requestedSkills || []), availability, JSON.stringify(languages || []), avatar]
    );

    // Clean up OTPs
    await query('DELETE FROM otps WHERE identifier = $1 OR identifier = $2', [`email:${email}`, `phone:${phone}`]);

    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    return NextResponse.json({ success: true, uid, token });
  } catch (error: any) {
    console.error('[Register] Error:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
