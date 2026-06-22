# Deployment Guide

## 1. Siapkan Google Spreadsheet

1. Buat spreadsheet baru.
2. Salin ID dari URL spreadsheet.
3. ID berada di antara `/d/` dan `/edit`.

## 2. Siapkan Google Drive

1. Buat folder `PAYROLL_UPLOADS`.
2. Di dalamnya buat folder `KTP`.
3. Di dalamnya buat folder `SURAT_KUASA`.
4. Salin folder ID dari URL masing-masing folder.

## 3. Siapkan Apps Script

1. Buka `https://script.google.com`.
2. Buat project baru.
3. Buat file:
   - `Config.gs`
   - `Setup.gs`
   - `Code.gs`
4. Salin isi file dari folder `apps-script`.

## 4. Isi Script Properties

Masuk ke Project Settings, tambahkan:

```text
API_CO_ID_KEY=api_key_api_co_id
SPREADSHEET_ID=1zc_UbQqmy9aCt1CcKZSxRq276DHfrh46Hts36dGDT0c
KTP_FOLDER_ID=1jhpp1WleiTwsxI0IltAkFylFGtFO-_AO
KK_FOLDER_ID=folder_id_kartu_keluarga
SURAT_KUASA_FOLDER_ID=1mqqs3jVAooV00rQpnD9OIHT-tI4NvEaA
ALLOWED_ORIGINS=http://localhost:5173,https://egs-esagemilangsakti.github.io,https://form.ptesagemilangsakti.com
```

`API_CO_ID_KEY` diisi di Script Properties Google Apps Script. Jangan isi API key di React, `.env` frontend, atau hardcode di file `.gs`. Gunakan origin final GitHub Pages yang benar untuk production.

## 5. Jalankan Setup

1. Pilih fungsi `setup`.
2. Klik Run.
3. Berikan permission.
4. Pastikan sheet `Payroll Submissions` dan `Audit Log` berhasil dibuat.

## 6. Publish Web App

1. Klik Deploy.
2. Pilih New deployment.
3. Type: Web app.
4. Execute as: Me.
5. Who has access: Anyone.
6. Klik Deploy.
7. Salin Web App URL.

## 7. Konfigurasi Frontend

Buat `.env.local`:

```env
VITE_API_URL=https://script.google.com/macros/s/WEB_APP_DEPLOYMENT_ID/exec
```

## 8. Run dan Build

```bash
npm install
npm run dev
npm run build
```

## 9. Deploy GitHub Pages

1. Push source code ke GitHub pada branch `main`.
2. Di repository GitHub, buka Settings -> Pages.
3. Pada Build and deployment, pilih Source: GitHub Actions.
4. Workflow `.github/workflows/deploy-pages.yml` akan menjalankan `npm ci` dan `npm run build`.
5. Setelah deploy selesai, salin URL GitHub Pages, contoh `https://username.github.io/nama-repo`.
6. Masukkan origin GitHub Pages ke Script Properties `ALLOWED_ORIGINS`.

Contoh `ALLOWED_ORIGINS` setelah GitHub Pages aktif:

```text
http://localhost:5173,https://egs-esagemilangsakti.github.io,https://form.ptesagemilangsakti.com
```

Jika GitHub Pages memakai path repository seperti `https://username.github.io/form-penggajian/`, origin yang dimasukkan tetap hanya:

```text
https://username.github.io
```

Setelah `ALLOWED_ORIGINS` diisi dengan origin GitHub Pages, deploy Apps Script sebagai Web App dan salin URL Web App ke variable GitHub repository.

Di GitHub repository, buka Settings -> Secrets and variables -> Actions -> Variables, lalu buat:

```text
VITE_API_URL=https://script.google.com/macros/s/WEB_APP_DEPLOYMENT_ID/exec
```
