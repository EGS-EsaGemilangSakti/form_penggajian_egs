import type { UploadPayload } from '../types/payroll';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const KTP_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const FAMILY_CARD_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const POWER_OF_ATTORNEY_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const COMPRESSED_IMAGE_MAX_DIMENSION = 1600;
const COMPRESSED_IMAGE_QUALITY = 0.72;
const COMPRESSIBLE_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export function isAllowedFile(file: File, allowedMimeTypes: string[]): boolean {
  return allowedMimeTypes.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes < 1 ? 2 : 1)} MB`;
}

export async function fileToBase64Payload(file: File, label = 'file'): Promise<UploadPayload> {
  const uploadFile = await prepareUploadFile(file);
  if (uploadFile.size > MAX_FILE_SIZE) {
    throw new Error(`File ${label} masih melebihi 5MB setelah dikompres: ${file.name}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Gagal membaca file ${label}: ${file.name}`));
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        size: uploadFile.size,
        base64,
      });
    };
    reader.readAsDataURL(uploadFile);
  });
}

function isCompressibleImage(file: File): boolean {
  return COMPRESSIBLE_IMAGE_TYPES.includes(file.type);
}

async function prepareUploadFile(file: File): Promise<File> {
  if (!isCompressibleImage(file)) return file;

  try {
    const compressedFile = await compressImageFile(file);
    return compressedFile.size < file.size ? compressedFile : file;
  } catch {
    return file;
  }
}

function compressImageFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal kompres gambar'));
    };

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, COMPRESSED_IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Browser tidak mendukung kompres gambar'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal kompres gambar'));
            return;
          }

          resolve(new File([blob], toJpegFileName(file.name), { type: 'image/jpeg', lastModified: Date.now() }));
        },
        'image/jpeg',
        COMPRESSED_IMAGE_QUALITY,
      );
    };

    image.src = objectUrl;
  });
}

function toJpegFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  return `${baseName || 'dokumen'}.jpg`;
}
