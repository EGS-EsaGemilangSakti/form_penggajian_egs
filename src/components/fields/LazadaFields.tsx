import { useMemo } from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { LAZADA_HUBS } from '../../constants/placements';
import type { PayrollFormValues } from '../../types/payroll';
import { FieldShell, inputClass } from './FieldShell';
import { SearchableSelect } from './SearchableSelect';

type LazadaFieldsProps = {
  register: UseFormRegister<PayrollFormValues>;
  setValue: UseFormSetValue<PayrollFormValues>;
  watch: UseFormWatch<PayrollFormValues>;
  hubError?: string;
  employeeIdError?: string;
};

export function LazadaFields({ register, setValue, watch, hubError, employeeIdError }: LazadaFieldsProps) {
  const hub = watch('hub') || '';
  const options = useMemo(() => LAZADA_HUBS.map((value) => ({ value, label: value })), []);

  return (
    <>
      <FieldShell label="Hub" error={hubError}>
        <input type="hidden" {...register('hub')} />
        <SearchableSelect
          value={hub}
          placeholder="Pilih hub"
          searchPlaceholder="Cari hub"
          emptyText="Hub tidak ditemukan"
          options={options}
          onChange={(value) => setValue('hub', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
        />
      </FieldShell>
      <FieldShell label="ID" error={employeeIdError}>
        <input className={inputClass} placeholder="Masukkan ID" maxLength={100} {...register('employeeId')} />
      </FieldShell>
    </>
  );
}
