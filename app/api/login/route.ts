import { NextResponse } from 'next/server';
import { query } from '@/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
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
    role: user.role,
    credits: user.credits,
    avatar: user.avatar,
  };

  return NextResponse.json({ token, user: camelUser });
}
