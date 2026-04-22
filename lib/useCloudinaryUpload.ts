export async function uploadToCloudinary(file: File, folder = 'boursedutemps') {
  // 1. Signature légère depuis notre API (pas de transit d'image)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const sigRes = await fetch('/api/upload/signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) throw new Error('Impossible d\'obtenir la signature Cloudinary');
  const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

  // 2. Upload DIRECT client → Cloudinary (0 Fast Data Transfer sur Vercel)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadRes.ok) throw new Error('Échec de l\'upload Cloudinary');
  return uploadRes.json();
}
