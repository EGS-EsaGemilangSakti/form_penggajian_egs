function calculateAge(birthDate, today) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || '');
  const display = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(birthDate || '');
  if (!iso && !display) return null;
  const year = Number(iso ? iso[1] : display[3]);
  const month = Number(iso ? iso[2] : display[2]);
  const day = Number(iso ? iso[3] : display[1]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(today || new Date());
  const part = (type) => Number(parts.find((value) => value.type === type).value);
  const currentYear = part('year'), currentMonth = part('month'), currentDay = part('day');
  if (year > currentYear || (year === currentYear && (month > currentMonth || (month === currentMonth && day > currentDay)))) return null;
  return currentYear - year - (currentMonth < month || (currentMonth === month && currentDay < day) ? 1 : 0);
}
const AGE_RESTRICTED_PLACEMENTS = ["JNT CARGO SURABAYA","JNT CARGO PONTIANAK 99A","SURABAYA","JNT CARGO KOSAMBI","JNT JKM CARGO CAKUNG","JNT CARGO CIREBON","CIREBON"];
function isAgeRestricted(placement) {
  return AGE_RESTRICTED_PLACEMENTS.indexOf(String(placement || '').trim().toUpperCase().replace(/J&T/g, 'JNT')) !== -1;
}
function isAgeAllowed(birthDate, placement, today) {
  if (!isAgeRestricted(placement)) return true;
  const age = calculateAge(birthDate, today);
  return age !== null && age >= 18 && age <= 50;
}

function assertPlacementAge(birthDate, placement) {
  if (!isAgeAllowed(birthDate, placement)) throw new Error('Usia Tidak Memenuhi Persyaratan: cabang ini mensyaratkan usia 18–50 tahun');
}
