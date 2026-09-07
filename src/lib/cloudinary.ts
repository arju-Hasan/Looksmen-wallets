import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload an image to Cloudinary directly inside the 'looksmen' folder in WebP format
 */
export async function uploadToCloudinary(
  fileBase64OrBuffer: string,
  folder = 'looksmen'
): Promise<{ url: string; public_id: string; format: string }> {
  const hasValidCreds = 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET && 
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    !process.env.CLOUDINARY_API_KEY.includes('your_');

  if (!hasValidCreds) {
    console.warn('[Cloudinary] Valid API keys not detected in .env. Returning data URL.');
    return {
      url: fileBase64OrBuffer,
      public_id: `local_preview_${Date.now()}`,
      format: 'webp',
    };
  }

  try {
    const result = await cloudinary.uploader.upload(fileBase64OrBuffer, {
      folder: 'looksmen', // Strictly stored in the looksmen folder
      format: 'webp',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'webp' }
      ],
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format || 'webp',
    };
  } catch (error: any) {
    console.warn('[Cloudinary Warning] Upload failed with error:', error?.message || error);
    console.warn('[Cloudinary] Falling back to compressed base64 image data.');
    return {
      url: fileBase64OrBuffer,
      public_id: `fallback_${Date.now()}`,
      format: 'webp',
    };
  }
}
