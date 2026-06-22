export type EmploymentStatus = 'Freelance' | 'Kontrak';
export type Position = 'Admin' | 'Kordinator' | 'Sorter' | 'Driver' | 'Kurir';
export type OwnershipStatus = 'PRIBADI' | 'ORANG LAIN';
export type Gender = 'Laki-laki' | 'Perempuan';
export type MaritalStatus = 'Menikah' | 'Belum Menikah' | 'Cerai Hidup' | 'Cerai Mati';
export type Religion = 'Islam' | 'Kristen' | 'Protestan' | 'Hindu' | 'Buddha' | 'Khonghucu';
export type PtkpCode = 'tk0' | 'k1' | 'k2' | 'k3' | 'tk1' | 'tk2' | 'tk3';
export type AccountValidationStatus = 'UNVALIDATED' | 'VALID' | 'INVALID';

export interface BankOption {
  bank_code: string;
  bank_name: string;
}

export interface UploadPayload {
  fileName: string;
  mimeType: string;
  size: number;
  base64: string;
}

export interface AccountValidationResult {
  status: AccountValidationStatus;
  score: number | null;
  validatedName: string;
  validationTimestamp: string;
  message: string;
}

export interface PayrollFormValues {
  email: string;
  fullName: string;
  address: string;
  addressDetail: string;
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string;
  districtCode: string;
  districtName: string;
  villageCode: string;
  villageName: string;
  postalCode: string;
  nik: string;
  birthPlaceCode: string;
  birthPlace: string;
  birthPlaceProvince: string;
  birthDate: string;
  gender: Gender | '';
  maritalStatus: MaritalStatus | '';
  religion: Religion | '';
  ptkpCode: PtkpCode | '';
  phone: string;
  placement: string;
  employmentStatus: EmploymentStatus | '';
  position: Position | '';
  firstWorkDate: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  accountValidation: AccountValidationResult;
  ownershipStatus: OwnershipStatus | '';
  ktpFile: FileList;
  familyCardFile: FileList;
  powerOfAttorneyFile?: FileList;
  dataAgreement: boolean;
  website?: string;
  formStartedAt: string;
}

export interface PayrollSubmitPayload {
  origin: string;
  submittedAt: string;
  website: string;
  data: Omit<PayrollFormValues, 'ktpFile' | 'familyCardFile' | 'powerOfAttorneyFile' | 'dataAgreement' | 'bankCode' | 'bankName'> & {
    bank: BankOption;
  };
  files: {
    ktp: UploadPayload;
    familyCard: UploadPayload;
    powerOfAttorney: UploadPayload | null;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
  submissionId?: string;
}

export interface BankValidationRequest {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_owner: string;
  origin: string;
}

export interface BankValidationResponse extends ApiResponse {
  status: 'VALID' | 'INVALID';
  score: number;
  validatedName: string;
  validationTimestamp: string;
}
