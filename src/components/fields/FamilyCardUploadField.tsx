import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { PayrollFormValues } from '../../types/payroll';

export function FamilyCardUploadField({ register, watch, error }: { register: UseFormRegister<PayrollFormValues>; watch: UseFormWatch<PayrollFormValues>; error?: string }) {
  const [preview, setPreview] = useState('');
  const fileList = watch('familyCardFile');
  const file = fileList?.item(0);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label className="block md:col-span-2">
      <span className="sr-only">Foto Kartu Keluarga</span>
      <div className="relative flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#4d4635] bg-[#1c1b1b] px-6 text-center transition hover:border-[#f2ca50]/70">
        {preview ? (
          <img src={preview} alt="Preview Kartu Keluarga" className="mb-4 max-h-32 w-full object-contain" />
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ca50]/10">
            <Users className="h-7 w-7 text-[#f2ca50]" />
          </div>
        )}
        <p className="text-sm font-semibold tracking-[0.05em] text-white">{file ? file.name : 'Upload Foto Kartu Keluarga'}</p>
        <p className="mt-1 max-w-52 text-xs font-medium leading-4 text-[#d0c5af]">Format JPG, PNG, atau PDF. Maks 5MB.</p>
        <input className="absolute inset-0 cursor-pointer opacity-0" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" {...register('familyCardFile')} />
      </div>
      {error ? <span className="mt-2 block text-sm text-accent">{error}</span> : null}
    </label>
  );
}
