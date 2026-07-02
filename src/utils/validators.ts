import type { UploadPayload } from '../types/payroll';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const KTP_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const FAMILY_CARD_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const POWER_OF_ATTORNEY_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export function isAllowedFile(file: File, allowedMimeTypes: string[]): boolean {
  return allowedMimeTypes.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

export function fileToBase64Payload(file: File, label = 'file'): Promise<UploadPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Gagal membaca file ${label}: ${file.name}`));
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        base64,
      });
    };
    reader.readAsDataURL(file);
  });
}
