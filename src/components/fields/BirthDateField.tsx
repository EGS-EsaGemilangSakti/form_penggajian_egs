import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { PayrollFormValues } from '../../types/payroll';
import { formatDateInput } from '../../utils/formatters';
import { FieldShell, inputClass } from './FieldShell';

export function BirthDateField({ register, setValue, error }: { register: UseFormRegister<PayrollFormValues>; setValue: UseFormSetValue<PayrollFormValues>; error?: string }) {
  const registration = register('birthDate');
  return (
    <FieldShell label="Tanggal Lahir" error={error}>
      <input
        className={inputClass}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        maxLength={10}
        {...registration}
        onChange={(event) => setValue('birthDate', formatDateInput(event.target.value), { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
      />
    </FieldShell>
  );
}
