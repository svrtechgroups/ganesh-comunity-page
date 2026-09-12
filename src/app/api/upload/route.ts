import { NextResponse } from 'next/server';
import { uploadFileViaFTP, UploadUseCase } from '@/lib/ftp-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const useCase = (formData.get('useCase') as UploadUseCase) || 'general';
    const identifier = (formData.get('identifier') as string) || 'upload';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided for upload.' },
        { status: 400 }
      );
    }

    // Check mime type (allow images and videos)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/jpg',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|mp4|webm|mov)$/i)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only image files (JPG, PNG, WebP, GIF, SVG) and video files (MP4, WebM, MOV) are supported.' },
        { status: 400 }
      );
    }

    // Max 25MB
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 25MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadFileViaFTP(buffer, file.name, useCase, identifier);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      relativePath: result.relativePath,
      filename: result.filename,
      storageType: result.storageType,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'File upload failed';
    console.error('[API UPLOAD ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
