import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { query, initDB } from '@/db';

export async function GET(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query('SELECT * FROM users WHERE uid = $1', [uid]);
  if ((result.rowCount ?? 0) === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = result.rows[0];
  // Convert snake_case to camelCase for frontend
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

  return NextResponse.json(camelUser);
}
