import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { getPositionsForPlacement } from '../../constants/placements';
import type { PayrollFormValues } from '../../types/payroll';
import { FieldShell, inputClass } from './FieldShell';

export function PositionField({ register, watch, error }: { register: UseFormRegister<PayrollFormValues>; watch: UseFormWatch<PayrollFormValues>; error?: string }) {
  const positions = getPositionsForPlacement(watch('placement'));
  return (
    <FieldShell label="Posisi" error={error}>
      <select className={inputClass} {...register('position')}>
        <option value="">Pilih posisi</option>
        {positions.map((position) => <option key={position} value={position}>{position}</option>)}
      </select>
    </FieldShell>
  );
}
