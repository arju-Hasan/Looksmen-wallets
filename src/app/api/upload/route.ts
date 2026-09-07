import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const base64Data = formData.get('base64') as string | null;

    if (!file && !base64Data) {
      return NextResponse.json(
        { success: false, error: 'No image file or base64 provided' },
        { status: 400 }
      );
    }

    let uploadPayload: string;

    if (base64Data) {
      uploadPayload = base64Data;
    } else if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/webp';
      uploadPayload = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid file payload' }, { status: 400 });
    }

    // Direct upload into the user's "looksmen" Cloudinary folder (with automatic fallback)
    const result = await uploadToCloudinary(uploadPayload, 'looksmen');

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      publicId: result.public_id,
      format: result.format || 'webp',
    });
  } catch (error: any) {
    console.error('[Upload API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
