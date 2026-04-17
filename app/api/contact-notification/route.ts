import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Loguer la notification reçue du webhook Supabase
    console.log('--- Webhook Notification Contact Reçue ---');
    console.log('Type:', body.type); // INSERT, UPDATE, etc.
    console.log('Table:', body.table);
    console.log('Données:', body.record);
    console.log('------------------------------------------');

    // On pourrait ajouter ici d'autres traitements internes si nécessaire
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur Webhook Notification:', error);
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 });
  }
}
