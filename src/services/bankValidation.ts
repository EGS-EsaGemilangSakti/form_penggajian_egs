import type { BankValidationRequest } from '../types/payroll';

export async function requestBankValidation(payload: BankValidationRequest) {
  return {
    success: true,
    message: 'Validasi rekening sementara dibypass',
    status: 'VALID' as const,
    score: 100,
    validatedName: payload.account_owner,
    validationTimestamp: new Date().toISOString(),
  };
}
