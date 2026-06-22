# link spreadsheet              : https://docs.google.com/spreadsheets/d 1zc_UbQqmy9aCt1CcKZSxRq276DHfrh46Hts36dGDT0c/edit?gid=0#gid=0
# link folder PAYROLL_UPLOADS   : https://drive.google.com/drive/folders/1NtUNujvqMP-2uJmo8qKGrcunT7L88txQ?hl=ID
## link folder KTP              : https://drive.google.com/drive/folders/1jhpp1WleiTwsxI0IltAkFylFGtFO-_AO?hl=ID
## link folder SURAT_KUASA      : https://drive.google.com/drive/folders/1mqqs3jVAooV00rQpnD9OIHT-tI4NvEaA?hl=ID

# ID yang dipakai Apps Script

SPREADSHEET_ID=1zc_UbQqmy9aCt1CcKZSxRq276DHfrh46Hts36dGDT0c
PAYROLL_UPLOADS_FOLDER_ID=1NtUNujvqMP-2uJmo8qKGrcunT7L88txQ
KTP_FOLDER_ID=1jhpp1WleiTwsxI0IltAkFylFGtFO-_AO
KK_FOLDER_ID=folder_id_kartu_keluarga
SURAT_KUASA_FOLDER_ID=1mqqs3jVAooV00rQpnD9OIHT-tI4NvEaA

# Script Properties yang perlu diisi di Google Apps Script

API_CO_ID_KEY=isi_api_key_api_co_id_di_sini
SPREADSHEET_ID=1zc_UbQqmy9aCt1CcKZSxRq276DHfrh46Hts36dGDT0c
KTP_FOLDER_ID=1jhpp1WleiTwsxI0IltAkFylFGtFO-_AO
KK_FOLDER_ID=folder_id_kartu_keluarga
SURAT_KUASA_FOLDER_ID=1mqqs3jVAooV00rQpnD9OIHT-tI4NvEaA
ALLOWED_ORIGINS=http://localhost:5173,https://egs-esagemilangsakti.github.io,https://form.ptesagemilangsakti.com

# Tempat menaruh API key

API key API.CO.ID jangan ditaruh di React, jangan ditaruh di .env frontend, dan jangan di-hardcode di file .gs.

Taruh di:
Google Apps Script -> Project Settings -> Script Properties -> Add script property

Property:
API_CO_ID_KEY

Value:
API key dari API.CO.ID

# Urutan deployment yang disarankan

1. Push project ke GitHub.
2. Aktifkan GitHub Pages dengan Source: GitHub Actions.
3. Tunggu URL GitHub Pages aktif.
4. Ambil origin URL GitHub Pages, contoh:
   https://form.ptesagemilangsakti.com
5. Isi Script Properties Apps Script:
   API_CO_ID_KEY
   SPREADSHEET_ID
   KTP_FOLDER_ID
   KK_FOLDER_ID
   SURAT_KUASA_FOLDER_ID
   ALLOWED_ORIGINS
6. Jalankan setup() di Apps Script.
7. Deploy Apps Script sebagai Web App.
8. Salin Web App URL.
9. Isi GitHub Actions variable:
   VITE_API_URL=https://script.google.com/macros/s/WEB_APP_DEPLOYMENT_ID/exec
10. Re-run workflow GitHub Pages agar frontend memakai URL Apps Script production.
