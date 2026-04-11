import { NextResponse } from 'next/server';
import { query } from '../../../db';
import jwt from 'jsonwebtoken';

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

export async function GET(request: Request, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  
  try {
    const result = await query(`SELECT * FROM ${dbTable} ORDER BY created_at DESC`);
    return NextResponse.json(toCamelCase(result.rows));
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;
  
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
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join(', ');
    
    const result = await query(
      `INSERT INTO ${dbTable} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
