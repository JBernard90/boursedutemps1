import { NextResponse } from 'next/server';
import { query } from '../../../../db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const toCamelCase = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

const authenticate = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
  } catch (e) {
    return null;
  }
};

export async function GET(request: Request, { params }: { params: Promise<{ table: string, id: string }> }) {
  const { table, id } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  const idCol = table === 'users' ? 'uid' : 'id';

  try {
    const result = await query(`SELECT * FROM ${dbTable} WHERE ${idCol} = $1`, [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "Not found", success: false }, { status: 404 });
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ table: string, id: string }> }) {
  const { table, id } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  const idCol = table === 'users' ? 'uid' : 'id';

  const user = authenticate(request);
  if (!user) return NextResponse.json({ error: "Non autorisé", success: false }, { status: 401 });

  try {
    const body = await request.json();
    delete body.id;
    delete body.uid;
    
    const keys = Object.keys(body);
    const values = Object.values(body).map(v => 
      (typeof v === 'object' && v !== null && !Array.isArray(v)) ? JSON.stringify(v) : 
      (Array.isArray(v) && typeof v[0] === 'object') ? JSON.stringify(v) : v
    );
    
    const existing = await query(`SELECT * FROM ${dbTable} WHERE ${idCol} = $1`, [id]);
    
    if (existing.rows.length > 0) {
      const setClause = keys.map((k, i) => {
        const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${col} = $${i + 1}`;
      }).join(', ');
      
      const result = await query(
        `UPDATE ${dbTable} SET ${setClause} WHERE ${idCol} = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return NextResponse.json(toCamelCase(result.rows[0]));
    } else {
      const allKeys = [idCol, ...keys];
      const allValues = [id, ...values];
      const placeholders = allKeys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = allKeys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join(', ');
      
      const result = await query(
        `INSERT INTO ${dbTable} (${columns}) VALUES (${placeholders}) RETURNING *`,
        allValues
      );
      return NextResponse.json(toCamelCase(result.rows[0]));
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ table: string, id: string }> }) {
  const { table, id } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  const idCol = table === 'users' ? 'uid' : 'id';

  const user = authenticate(request);
  if (!user) return NextResponse.json({ error: "Non autorisé", success: false }, { status: 401 });

  try {
    const body = await request.json();
    delete body.id;
    delete body.uid;
    
    const keys = Object.keys(body);
    if (keys.length === 0) return NextResponse.json({ success: true });

    const values = Object.values(body).map(v => 
      (typeof v === 'object' && v !== null && !Array.isArray(v)) ? JSON.stringify(v) : 
      (Array.isArray(v) && typeof v[0] === 'object') ? JSON.stringify(v) : v
    );
    
    const setClause = keys.map((k, i) => {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${col} = $${i + 1}`;
    }).join(', ');
    
    const result = await query(
      `UPDATE ${dbTable} SET ${setClause} WHERE ${idCol} = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ table: string, id: string }> }) {
  const { table, id } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  const idCol = table === 'users' ? 'uid' : 'id';

  const user = authenticate(request);
  if (!user) return NextResponse.json({ error: "Non autorisé", success: false }, { status: 401 });

  try {
    await query(`DELETE FROM ${dbTable} WHERE ${idCol} = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
