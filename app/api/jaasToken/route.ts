import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { query } from '@/db';

const APP_ID = process.env.JAAS_APP_ID!;
const KEY_ID = process.env.JAAS_KEY_ID!;

export async function POST(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { roomName } = await req.json();
  if (!roomName) return NextResponse.json({ error: 'roomName requis' }, { status: 400 });

  const privateKey = process.env.JAAS_PRIVATE_KEY;
  if (!privateKey || !APP_ID || !KEY_ID) {
    return NextResponse.json({ error: 'Variables JAAS non configurées sur Vercel' }, { status: 503 });
  }

  try {
    // Get user info from DB
    const result = await query('SELECT * FROM users WHERE uid = $1', [uid]);
    const user = result.rows[0];

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      aud: 'jitsi',
      iss: 'chat',
      iat: now,
      exp: now + 60 * 60 * 4, // 4 heures
      nbf: now - 5,
      sub: APP_ID,
      context: {
        features: {
          livestreaming: true,
          recording: false,
          transcription: false,
          'outbound-call': false,
        },
        user: {
          'hidden-from-recorder': false,
          moderator: true,
          name: user ? `${user.first_name} ${user.last_name}` : 'Utilisateur',
          id: uid,
          avatar: user?.avatar || '',
          email: user?.email || '',
        },
      },
      room: roomName,
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      keyid: KEY_ID,
    });

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('JaaS token error:', error);
    return NextResponse.json({ error: error.message || 'Erreur génération token' }, { status: 500 });
  }
}
