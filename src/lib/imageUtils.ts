/**
 * Convert any image File (JPEG, PNG, HEIC, etc.) to a compressed WebP Blob/File
 * using the HTML5 Canvas API in the browser.
 */
export async function convertImageToWebP(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<{ file: File; dataUrl: string; sizeReductionPercent: number }> {
  return new Promise((resolve, reject) => {
    // If not in browser or already webp and small, still normalize
    if (typeof window === 'undefined') {
      reject(new Error('convertImageToWebP can only run in the browser'));
      return;
    }

    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas 2D context'));
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to WebP Blob conversion failed'));
              return;
            }

            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            const webpFileName = `${fileNameWithoutExt}-${Date.now()}.webp`;
            const webpFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL('image/webp', quality);
            const sizeReductionPercent = Math.max(
              0,
              Math.round(((originalSize - webpFile.size) / originalSize) * 100)
            );

            resolve({
              file: webpFile,
              dataUrl,
              sizeReductionPercent,
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for WebP conversion'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
