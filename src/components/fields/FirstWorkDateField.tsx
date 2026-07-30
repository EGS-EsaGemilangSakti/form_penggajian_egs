import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { PayrollFormValues } from '../../types/payroll';
import { formatDateInput } from '../../utils/formatters';
import { FieldShell, inputClass } from './FieldShell';

export function FirstWorkDateField({ register, setValue, error }: { register: UseFormRegister<PayrollFormValues>; setValue: UseFormSetValue<PayrollFormValues>; error?: string }) {
  const registration = register('firstWorkDate');
  return (
    <FieldShell label="Tanggal Kerja Pertama" error={error}>
      <input
        className={inputClass}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        maxLength={10}
        {...registration}
        onChange={(event) => setValue('firstWorkDate', formatDateInput(event.target.value), { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
      />
    </FieldShell>
  );
}
