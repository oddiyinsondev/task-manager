import type { TaskFile } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function processFile(file: File): Promise<TaskFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => reject(new Error('Faylni o‘qishda xatolik yuz berdi'));
    reader.readAsDataURL(file);
  });
}

export async function processMultipleFiles(files: FileList | File[]): Promise<TaskFile[]> {
  const fileArray = Array.from(files);
  const results: TaskFile[] = [];

  for (const f of fileArray) {
    try {
      const processed = await processFile(f);
      results.push(processed);
    } catch (err) {
      console.error('Fayl yuklashda xatolik:', f.name, err);
    }
  }

  return results;
}

export function downloadTaskFile(file: TaskFile): void {
  const a = document.createElement('a');
  a.href = file.dataUrl;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
