import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'boursedutemps';

    if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });

    // Convert File to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur upload' }, { status: 500 });
  }
}

// Avatar upload with automatic crop to square
export async function PUT(req: Request) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'boursedutemps/avatars',
      public_id: `avatar_${uid}`,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur upload avatar' }, { status: 500 });
  }
}
