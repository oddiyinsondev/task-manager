import { TaskImage } from '../types';

/**
 * Rasmni brauzer Canvas orqali optimallashtirib siqish (max 1280px, 0.8 quality JPEG/WEBP)
 */
export async function compressAndConvertImage(file: File): Promise<TaskImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original Base64 if canvas is unavailable
          resolve({
            id: 'img_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            dataUrl: e.target?.result as string,
            size: file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Siqilgan dataUrl (JPEG 0.8)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        resolve({
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          dataUrl: compressedDataUrl,
          size: Math.round((compressedDataUrl.length * 3) / 4),
        });
      };

      img.onerror = () => reject(new Error('Rasmni yuklashda xatolik'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Faylni o‘qishda xatolik'));
    reader.readAsDataURL(file);
  });
}

/**
 * Bir nechta faylni ketma-ket siqib qaytarish
 */
export async function processMultipleImages(files: FileList | File[]): Promise<TaskImage[]> {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  const results: TaskImage[] = [];

  for (const file of fileArray) {
    try {
      const compressed = await compressAndConvertImage(file);
      results.push(compressed);
    } catch (err) {
      console.error('Rasm siqishda xatolik:', file.name, err);
    }
  }

  return results;
}
