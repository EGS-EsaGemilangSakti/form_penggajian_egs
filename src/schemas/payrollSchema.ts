import { z } from 'zod';
import { BANKS } from '../constants/banks';
import { EMPLOYMENT_STATUSES, OWNERSHIP_STATUSES, PLACEMENTS, POSITIONS } from '../constants/placements';
import { KTP_MIME_TYPES, MAX_FILE_SIZE, POWER_OF_ATTORNEY_MIME_TYPES } from '../utils/validators';

const fileListSchema = z.custom<FileList>((value) => value instanceof FileList && value.length > 0, {
  message: 'File wajib diunggah',
});

function validateFile(fileList: FileList, mimeTypes: string[]): boolean {
  const file = fileList.item(0);
  return Boolean(file && mimeTypes.includes(file.type) && file.size <= MAX_FILE_SIZE);
}

export const payrollSchema = z
  .object({
    email: z.string().trim().email('Email tidak valid'),
    fullName: z.string().trim().min(1, 'Nama wajib diisi').regex(/^[A-Z ]+$/, 'Nama hanya boleh huruf kapital dan spasi'),
    address: z.string().trim().min(10, 'Alamat minimal 10 karakter').max(500, 'Alamat maksimal 500 karakter'),
    addressDetail: z.string().trim().min(5, 'Detail alamat minimal 5 karakter').max(200, 'Detail alamat maksimal 200 karakter'),
    provinceCode: z.string().regex(/^\d{2}$/, 'Provinsi wajib dipilih'),
    provinceName: z.string().min(1, 'Provinsi wajib dipilih'),
    regencyCode: z.string().regex(/^\d{4}$/, 'Kabupaten/kota wajib dipilih'),
    regencyName: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
    districtCode: z.string().regex(/^\d{6}$/, 'Kecamatan wajib dipilih'),
    districtName: z.string().min(1, 'Kecamatan wajib dipilih'),
    villageCode: z.string().regex(/^\d{10}$/, 'Kelurahan/desa wajib dipilih'),
    villageName: z.string().min(1, 'Kelurahan/desa wajib dipilih'),
    postalCode: z.string().regex(/^\d{5}$/, 'Kode pos wajib 5 digit'),
    nik: z.string().regex(/^\d{16}$/, 'NIK wajib 16 digit angka'),
    birthPlaceCode: z.string().regex(/^\d{4}$/, 'Tempat lahir wajib dipilih dari daftar kota/kabupaten'),
    birthPlace: z.string().trim().min(1, 'Tempat lahir wajib dipilih dari daftar').regex(/^[A-Za-z ]+$/, 'Tempat lahir wajib dipilih dari daftar'),
    birthPlaceProvince: z.string().min(1, 'Provinsi tempat lahir wajib terisi'),
    birthDate: z.string().refine((value) => Boolean(value) && new Date(value) <= new Date(), 'Tanggal lahir tidak boleh masa depan'),
    phone: z.string().regex(/^\d{10,15}$/, 'Nomor telepon wajib 10-15 digit'),
    placement: z.enum(PLACEMENTS, { message: 'Penempatan wajib dipilih' }),
    employmentStatus: z.enum(EMPLOYMENT_STATUSES, { message: 'Status karyawan wajib dipilih' }),
    position: z.enum(POSITIONS, { message: 'Posisi wajib dipilih' }),
    firstWorkDate: z.string().min(1, 'Tanggal kerja pertama wajib diisi'),
    bankCode: z.string().refine((code) => BANKS.some((bank) => bank.bank_code === code), 'Bank wajib dipilih'),
    bankName: z.string().min(1, 'Bank wajib dipilih'),
    accountNumber: z.string().regex(/^\d{5,30}$/, 'Nomor rekening wajib 5-30 digit angka'),
    accountOwner: z.string().trim().min(1, 'Nama pemilik rekening wajib diisi').regex(/^[A-Z ]+$/, 'Nama pemilik rekening hanya boleh huruf kapital dan spasi'),
    accountValidation: z.object({
      status: z.enum(['UNVALIDATED', 'VALID', 'INVALID']),
      score: z.number().nullable(),
      validatedName: z.string(),
      validationTimestamp: z.string(),
      message: z.string(),
    }),
    ownershipStatus: z.enum(OWNERSHIP_STATUSES, { message: 'Status kepemilikan rekening wajib dipilih' }),
    ktpFile: fileListSchema.refine((fileList) => validateFile(fileList, KTP_MIME_TYPES), 'KTP wajib pdf, jpg, jpeg, atau png maksimal 5MB'),
    powerOfAttorneyFile: z.custom<FileList>().optional(),
    dataAgreement: z.literal(true, { errorMap: () => ({ message: 'Pernyataan wajib disetujui' }) }),
    website: z.string().optional(),
    formStartedAt: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.accountValidation.status !== 'VALID') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountValidation'], message: 'Rekening wajib divalidasi dan valid' });
    }
    const fileList = data.powerOfAttorneyFile;
    const hasFile = fileList instanceof FileList && fileList.length > 0;
    if (data.ownershipStatus === 'ORANG LAIN' && !hasFile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['powerOfAttorneyFile'], message: 'Surat kuasa wajib diunggah' });
    }
    if (hasFile && !validateFile(fileList, POWER_OF_ATTORNEY_MIME_TYPES)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['powerOfAttorneyFile'], message: 'Surat kuasa wajib pdf, jpg, jpeg, atau png maksimal 5MB' });
    }
  });

export type PayrollSchema = z.infer<typeof payrollSchema>;
