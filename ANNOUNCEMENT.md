# Announcement Sistem Form Penggajian Karyawan

Dokumen ini menjelaskan sistem Form Penggajian Karyawan PT ESA Gemilang Sakti, mencakup tujuan sistem, fitur, alur kerja, aturan validasi, keamanan, dan pengelolaan data.

## Deskripsi Sistem

Form Penggajian Karyawan adalah aplikasi web publik untuk mengumpulkan data penggajian karyawan secara terstruktur. Sistem ini digunakan untuk menerima data identitas, alamat domisili, informasi pekerjaan, data rekening, serta dokumen pendukung seperti KTP dan Surat Kuasa.

Frontend berjalan sebagai website statis melalui GitHub Pages. Backend berjalan menggunakan Google Apps Script Web App, dengan penyimpanan data ke Google Spreadsheet dan penyimpanan dokumen ke Google Drive.

## Tujuan Sistem

- Mengumpulkan data payroll karyawan dari berbagai penempatan dalam satu form online.
- Menyimpan semua data masuk ke satu sheet utama sebagai pusat data.
- Membuat sheet terpisah berdasarkan penempatan agar data lebih mudah dipantau.
- Memvalidasi rekening sebelum data dapat dikirim.
- Menandai data duplikat berdasarkan NIK agar mudah ditindaklanjuti.
- Mengurangi risiko input tidak valid melalui validasi frontend dan backend.

## Fitur Utama

### 1. Form Multi-Step

Form terdiri dari 3 step:

1. Identitas
2. Pekerjaan dan rekening
3. Dokumen dan konfirmasi

User tidak dapat lanjut ke step berikutnya jika data wajib pada step aktif belum lengkap atau belum valid.

### 2. Penyimpanan Progress Lokal

Data form disimpan sementara di localStorage browser. Jika user menutup atau refresh website, progress pengisian tetap tersimpan.

Catatan:

- File upload tidak disimpan ke localStorage karena dibatasi oleh browser.
- Data localStorage akan dihapus otomatis setelah submit berhasil.

### 3. Dropdown Wilayah Searchable

Dropdown berikut memiliki search di dalam dropdown:

- Tempat Lahir
- Provinsi
- Kabupaten/Kota
- Kecamatan
- Kelurahan/Desa
- Bank

Data wilayah diambil melalui API regional dan diproses melalui Google Apps Script.

### 4. Validasi Rekening

Sebelum lanjut ke step dokumen, rekening wajib divalidasi melalui API.CO.ID.

Syarat lanjut ke step berikutnya:

- Bank dipilih.
- Nomor rekening valid secara format.
- Nama pemilik rekening valid secara format.
- Status rekening dari backend adalah `VALID`.

Jika status rekening belum valid, user tidak dapat lanjut.

### 5. Upload Dokumen

Dokumen yang didukung:

- KTP: PDF, JPG, JPEG, PNG.
- Surat Kuasa: PDF, JPG, JPEG, PNG.

Ukuran maksimal file adalah 5MB.

Rules:

- KTP wajib diunggah.
- Surat Kuasa hanya muncul jika Status Kepemilikan Rekening adalah `ORANG LAIN`.
- Jika rekening milik `ORANG LAIN`, Surat Kuasa wajib diunggah.
- Jika rekening milik `PRIBADI`, Surat Kuasa tidak diperlukan.

### 6. Loader Submit

Saat proses submit berjalan, sistem menampilkan overlay loading agar user memahami bahwa data dan dokumen sedang diproses.

### 7. Background Music

Sistem memutar audio `mars_esa.mp3` setelah interaksi pertama user pada halaman. Autoplay dilakukan setelah aksi pertama karena browser modern umumnya memblokir audio sebelum ada gesture user.

### 8. Favicon dan Branding

Website menggunakan logo dari aset aplikasi sebagai favicon dan header brand.

## Penyimpanan Data

### Sheet Utama

Semua data dari seluruh penempatan tetap masuk ke sheet utama:

```text
Payroll Submissions
```

Sheet ini berfungsi sebagai pusat penampungan seluruh submission dari form.

### Sheet Per Penempatan

Selain masuk ke sheet utama, setiap data juga otomatis disalin ke sheet berdasarkan nilai kolom Penempatan.

Contoh sheet penempatan:

- JNT CARGO CIREBON
- JNT TGR
- JNT SUNTER
- FASTRANS
- MONDE
- OB HQ
- GO TO BALI

Jika sheet penempatan belum ada, Apps Script akan membuatnya otomatis.

### Sinkronisasi Data Lama

Function `setup()` akan:

- Membuat sheet penempatan jika belum ada.
- Mengisi header pada setiap sheet.
- Menyalin data lama dari `Payroll Submissions` ke sheet penempatan masing-masing.
- Memasang conditional formatting duplicate NIK.

## Kolom Data

Kolom yang digunakan pada sheet utama dan sheet penempatan:

```text
Submission ID
Created At
Email
Nama Lengkap
Alamat
NIK
Tempat Lahir
Tanggal Lahir
Nomor Telepon
Penempatan
Status Karyawan
Posisi
Tanggal Kerja Pertama
Bank Name
Bank Code
Nomor Rekening
Nama Pemilik Rekening
Status Rekening
Validation Score
Validated Name
Validation Timestamp
Status Kepemilikan Rekening
KTP URL
Surat Kuasa URL
```

## Rules Duplikat NIK

Acuan data duplikat adalah kolom:

```text
NIK
```

Jika terdapat lebih dari satu data dengan NIK yang sama dalam sheet yang sama, seluruh cell pada baris terkait akan diberi warna merah.

Penerapan duplicate marking berlaku pada:

- Sheet utama `Payroll Submissions`.
- Setiap sheet penempatan.

Contoh:

Jika pada sheet `JNT TGR` terdapat dua baris dengan NIK yang sama, maka kedua baris tersebut akan ditandai merah dari kolom `Submission ID` sampai `Surat Kuasa URL`.

## Rules Validasi Input

### Identitas

- Email wajib valid.
- Nama lengkap wajib huruf kapital dan spasi.
- NIK wajib 16 digit angka.
- Nomor telepon wajib 10 sampai 15 digit angka.
- Tempat lahir wajib dipilih dari daftar.
- Tanggal lahir tidak boleh berada di masa depan.

### Alamat Domisili

- Provinsi wajib dipilih.
- Kabupaten/Kota wajib dipilih.
- Kecamatan wajib dipilih.
- Kelurahan/Desa wajib dipilih.
- Kode pos wajib 5 digit angka.
- Detail alamat wajib diisi minimal 5 karakter.
- Data alamat akhir disimpan dalam satu kolom `Alamat`.

### Pekerjaan

- Penempatan wajib dipilih dari daftar resmi.
- Status karyawan wajib `Freelance` atau `Kontrak`.
- Posisi wajib dipilih dari daftar resmi.
- Tanggal kerja pertama wajib diisi.

### Rekening

- Bank wajib dipilih dari daftar.
- Nomor rekening hanya angka dan wajib 5 sampai 30 digit.
- Nama pemilik rekening wajib huruf kapital dan spasi.
- Rekening wajib divalidasi dan berstatus `VALID`.

### Dokumen

- KTP wajib diunggah.
- Surat Kuasa wajib hanya jika rekening milik orang lain.
- File wajib sesuai MIME type yang diizinkan.
- Ukuran file maksimal 5MB.

## Keamanan Sistem

Sistem menggunakan validasi berlapis di frontend dan backend.

### Frontend

- React Hook Form dan Zod untuk validasi input.
- Sanitasi input teks.
- Input angka dibatasi hanya digit.
- Validasi file sebelum submit.
- Disable submit saat proses pengiriman.
- Pencegahan double submit.
- Draft localStorage dihapus setelah submit berhasil.

### Backend Apps Script

- Validasi ulang seluruh payload.
- Reject unknown fields.
- Origin whitelist melalui `ALLOWED_ORIGINS`.
- Rate limit berbasis CacheService.
- Honeypot field untuk bot.
- Timestamp validation.
- UUID untuk setiap submission.
- Validasi MIME type dan ukuran file.
- Upload file ke Google Drive.
- Validasi rekening ulang ke API.CO.ID saat submit.
- Audit log untuk success dan error.

## Deployment

### Frontend

Frontend dideploy melalui GitHub Pages dan GitHub Actions.

Untuk update UI atau frontend:

```bash
bash ship.sh "Nama Commit"
```

Script akan menjalankan:

```text
npm run lint
npm run build
git add .
git commit
git push
```

Setelah push, GitHub Actions akan menjalankan proses deploy otomatis.

### Backend Apps Script

Jika ada perubahan pada:

- `apps-script/Code.gs`
- `apps-script/Setup.gs`
- `apps-script/Config.gs`

Maka file terkait perlu dipaste ulang ke Google Apps Script.

Untuk update Web App setelah perubahan `Code.gs`:

1. Save project Apps Script.
2. Buka Deploy.
3. Pilih Manage deployments.
4. Edit deployment Web App yang aktif.
5. Pilih New version.
6. Klik Deploy.

Untuk update setup spreadsheet setelah perubahan `Setup.gs`:

1. Save project Apps Script.
2. Pilih function `setup`.
3. Klik Run.

## Catatan Operasional

- Jangan menghapus header pada sheet utama maupun sheet penempatan.
- Jangan mengubah urutan kolom tanpa menyesuaikan Apps Script.
- Sheet penempatan dibuat berdasarkan daftar `PLACEMENTS` di `Code.gs`.
- Jika ada penempatan baru, daftar `PLACEMENTS` harus diperbarui di frontend dan Apps Script.
- Jika Web App URL berubah karena New Deployment, update GitHub variable `VITE_API_URL`.
- Jika hanya update versi deployment yang sama, URL `/exec` tetap sama dan `VITE_API_URL` tidak perlu diubah.

## Ringkasan

Sistem ini dibuat untuk menjadi form payroll publik yang terstruktur, tervalidasi, dan mudah diaudit. Data tetap terkumpul di satu sheet utama, tetapi juga otomatis dipisahkan berdasarkan penempatan. Duplicate NIK ditandai otomatis di setiap sheet agar tim operasional dapat segera mengidentifikasi data yang perlu dicek ulang.
