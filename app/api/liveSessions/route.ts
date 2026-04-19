import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

async function getUidFromRequest(req: Request): Promise<string | null> {
  // Try local JWT first
  const localUid = getUserIdFromRequest(req);
  if (localUid) return localUid;
  
  // Try Supabase JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  
  try {
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) return null;
    // Find user in our DB by email
    const { query } = await import('@/db');
    const result = await query('SELECT uid FROM users WHERE email = $1', [user.email]);
    return result.rows[0]?.uid || null;
  } catch { return null; }
}


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

// ── POST : créer une session Jitsi ──────────────────────────────────────────
export async function POST(req: Request) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { title, type, hostName, hostAvatar } = await req.json();
  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const roomName = `bdt-${uid.slice(0, 8)}-${Date.now()}`;
  const appId = process.env.JAAS_APP_ID || 'vpaas-magic-cookie-017a1705a9c54e49afac8d78f0522e2a';
    const roomUrl = `https://8x8.vc/${appId}/${roomName}`;

  try {
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
  } catch (error: any) {
    console.error('Error creating live session:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE// ── DELETE : terminer la session + supprimer la room Daily.co ───────────────
export async function DELETE(req: Request) {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
  const uid = await getUidFromRequest(req);
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

    // Supprimer de la DB
    await query('DELETE FROM live_sessions WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
