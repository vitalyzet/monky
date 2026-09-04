import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({ error: 'R2 nu este configurat pe server.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier nu a fost încărcat.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = file.name.split('.').pop();
    const fileName = `ad-images/${uniqueSuffix}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Return the public URL
    // Make sure publicUrl doesn't end with a slash
    const baseUrl = publicUrl?.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    const finalUrl = `${baseUrl}/${fileName}`;

    return NextResponse.json({ url: finalUrl }, { status: 200 });
  } catch (error) {
    console.error('Eroare la upload:', error);
    return NextResponse.json({ error: 'Eroare internă la upload.' }, { status: 500 });
  }
}
