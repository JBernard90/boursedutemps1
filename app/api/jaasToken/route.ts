import { NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';
import { getUserIdFromRequest } from '@/lib/auth';

const APP_ID = process.env.NEXT_PUBLIC_JAAS_APP_ID!;
const KID = process.env.JAAS_KID!;
const PRIVATE_KEY_PEM = process.env.JAAS_PRIVATE_KEY!;

export async function POST(req: Request) {
  try {
    const uid = getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { roomName, userName, userEmail, userAvatar, isModerator } = await req.json();

    // Normalise la clé privée (remplace les \n littéraux si nécessaire)
    const pemKey = PRIVATE_KEY_PEM.replace(/\\n/g, '\n');

    const privateKey = await importPKCS8(pemKey, 'RS256');

    const token = await new SignJWT({
      aud: 'jitsi',
      iss: 'chat',
      sub: APP_ID,
      room: roomName || '*',
      context: {
        user: {
          id: uid,
          name: userName || 'Utilisateur',
          email: userEmail || '',
          avatar: userAvatar || '',
          moderator: isModerator ?? false,
          'hidden-from-recorder': false,
        },
        features: {
          livestreaming: true,
          recording: true,
          transcription: false,
          'outbound-call': false,
        },
      },
    })
      .setProtectedHeader({ alg: 'RS256', kid: KID, typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('4h')
      .setNotBefore('-5s')
      .sign(privateKey);

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('JaaS token error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}