import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getUserIdFromRequest } from '@/lib/auth';

const DAILY_API_KEY = process.env.DAILY_API_KEY!;
const DAILY_API_URL = 'https://api.daily.co/v1';

// ── GET : toutes les sessions actives ───────────────────────────────────────
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM live_sessions ORDER BY started_at DESC'
    );
    const sessions = result.rows.map(s => ({
      id: s.id,
      roomName: s.room_name,
      roomUrl: s.room_url,
      title: s.title,
      type: s.type,
      hostId: s.host_id,
      hostName: s.host_name,
      hostAvatar: s.host_avatar,
      participantCount: s.participant_count,
      startedAt: s.started_at,
    }));
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST : créer une room Daily.co + enregistrer en DB ──────────────────────
export async function POST(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { title, type, hostName, hostAvatar } = await req.json();
  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const roomName = `bdt-${uid.slice(0, 8)}-${Date.now()}`;

  try {
    // 1. Créer la room sur Daily.co
    const dailyRes = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          max_participants: 100,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'local',
          start_video_off: false,
          start_audio_off: false,
          lang: 'fr',
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // expire dans 4h
        },
      }),
    });

    if (!dailyRes.ok) {
      const err = await dailyRes.json();
      console.error('Daily.co error:', err);
      return NextResponse.json({ error: 'Impossible de créer la room Daily.co' }, { status: 500 });
    }

    const dailyData = await dailyRes.json();
    const roomUrl = dailyData.url;

    // 2. Enregistrer en DB
    const result = await query(
      `INSERT INTO live_sessions (room_name, room_url, title, type, host_id, host_name, host_avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [roomName, roomUrl, title, type || 'webinaire', uid, hostName, hostAvatar || null]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      roomName,
      roomUrl,
      title,
      type: type || 'webinaire',
      hostId: uid,
      hostName,
      hostAvatar: hostAvatar || null,
      participantCount: 0,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE : terminer la session + supprimer la room Daily.co ───────────────
export async function DELETE(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id, roomName } = await req.json();

  try {
    // Vérifier que c'est bien l'hôte ou un admin
    const existing = await query(
      'SELECT * FROM live_sessions WHERE id = $1',
      [id]
    );
    if (!existing.rowCount || existing.rowCount === 0) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }
    const session = existing.rows[0];
    const userRes = await query('SELECT role FROM users WHERE uid = $1', [uid]);
    const isAdmin = userRes.rows[0]?.role === 'admin';

    if (session.host_id !== uid && !isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 1. Supprimer la room sur Daily.co
    await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
    });

    // 2. Supprimer de la DB
    await query('DELETE FROM live_sessions WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
