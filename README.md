# FORM PENGGAJIAN KARYAWAN

Aplikasi web publik untuk pengumpulan data penggajian karyawan.

## Struktur Folder

```text
.
├── apps-script
│   ├── Code.gs
│   ├── Config.gs
│   └── Setup.gs
├── src
│   ├── components
│   │   ├── fields
│   │   ├── forms
│   │   └── layout
│   ├── constants
│   ├── hooks
│   ├── pages
│   ├── schemas
│   ├── services
│   ├── types
│   └── utils
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Install

```bash
npm install
```

## Environment Frontend

Buat file `.env.local`:

```env
VITE_API_URL=https://script.google.com/macros/s/WEB_APP_DEPLOYMENT_ID/exec
```

## Run Local

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy GitHub Pages

1. Push project ke GitHub.
2. Jalankan `npm run build`.
3. Deploy folder `dist` ke GitHub Pages melalui GitHub Actions atau branch `gh-pages`.
4. Tambahkan origin GitHub Pages ke Script Properties `ALLOWED_ORIGINS`.

## Membuat Spreadsheet

1. Buat Google Spreadsheet baru.
2. Salin Spreadsheet ID dari URL.
3. Jalankan fungsi `setup()` di Apps Script setelah Script Properties diisi.

## Membuat Folder Drive

Buat folder:

```text
PAYROLL_UPLOADS
├── KTP
└── SURAT_KUASA
```

Salin folder ID untuk `KTP` dan `SURAT_KUASA`.

## Deploy Apps Script

1. Buka `script.google.com`.
2. Buat project baru.
3. Buat file `Config.gs`, `Setup.gs`, dan `Code.gs`.
4. Isi masing-masing file dari folder `apps-script`.
5. Buka Project Settings.
6. Tambahkan Script Properties:

```text
API_CO_ID_KEY=api_key_api_co_id
SPREADSHEET_ID=spreadsheet_id
KTP_FOLDER_ID=folder_id_ktp
KK_FOLDER_ID=folder_id_kartu_keluarga
SURAT_KUASA_FOLDER_ID=folder_id_surat_kuasa
ALLOWED_ORIGINS=http://localhost:5173,https://username.github.io
```

7. Jalankan `setup()` dan berikan permission.
8. Klik Deploy, pilih New deployment.
9. Pilih Web app.
10. Execute as: Me.
11. Who has access: Anyone.
12. Deploy.
13. Salin Web App URL ke `VITE_API_URL`.

## Validasi Keamanan

Frontend memakai React Hook Form, Zod, sanitasi input, validasi file, disable submit saat loading, pencegahan double submit, honeypot, dan dialog konfirmasi.

Backend Apps Script melakukan validasi ulang seluruh field, reject unknown fields, origin whitelist berbasis payload origin, rate limiting CacheService, honeypot, UUID submission, timestamp validation, MIME validation, file size validation, audit logging, validasi rekening ulang ke API.CO.ID, upload Drive, dan penyimpanan Spreadsheet.
