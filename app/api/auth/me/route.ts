import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '../../../../db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: "Non autorisé", success: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { uid: string, email: string };
    
    const result = await query('SELECT * FROM users WHERE uid = $1', [decoded.uid]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé.", success: false }, { status: 404 });
    }
    
    const { password, ...userWithoutPassword } = result.rows[0];
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('[Auth Me] Error:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 401 });
  }
}
