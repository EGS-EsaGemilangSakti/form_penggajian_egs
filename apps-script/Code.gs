const SHEET_NAME = 'Payroll Submissions';
const AUDIT_SHEET_NAME = 'Audit Log';
const API_CO_ID_URL = 'https://use.api.co.id/validation/bank';
const REGIONAL_API_BASE_URL = 'https://use.api.co.id/regional/indonesia';
const HEADERS = [
  'Submission ID',
  'Created At',
  'Email',
  'Nama Lengkap',
  'Alamat',
  'NIK',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Nomor Telepon',
  'Jenis Kelamin',
  'Status Pernikahan',
  'Agama',
  'PTKP',
  'Penempatan',
  'Status Karyawan',
  'Posisi',
  'Tanggal Kerja Pertama',
  'Bank Name',
  'Bank Code',
  'Nomor Rekening',
  'Nama Pemilik Rekening',
  'Status Rekening',
  'Validation Score',
  'Validated Name',
  'Validation Timestamp',
  'Status Kepemilikan Rekening',
  'KTP URL',
  'Surat Kuasa URL',
  'Kartu Keluarga URL'
];
const ALLOWED_FIELDS = [
  'email',
  'fullName',
  'address',
  'addressDetail',
  'provinceCode',
  'provinceName',
  'regencyCode',
  'regencyName',
  'districtCode',
  'districtName',
  'villageCode',
  'villageName',
  'postalCode',
  'nik',
  'birthPlaceCode',
  'birthPlace',
  'birthPlaceProvince',
  'birthDate',
  'gender',
  'maritalStatus',
  'religion',
  'ptkpCode',
  'phone',
  'placement',
  'employmentStatus',
  'position',
  'firstWorkDate',
  'accountNumber',
  'accountOwner',
  'accountValidation',
  'ownershipStatus',
  'formStartedAt',
  'bank'
];
const PLACEMENTS = ['JNT CARGO CIREBON', 'JNT TGR', 'JNT SUNTER', 'JNT DRIVER PKU', 'JNT BTN', 'MONDE', 'JNT SEMARANG', 'JNT TEGAL', 'JNT PATI', 'JNT EXPRESS MEDAN', 'JNT SMQ 05', 'JNT SMQ 99', 'OB HQ', 'SPRINTER JET JKT', 'GO TO BALI', 'CARGO BKI', 'JNT CARGO SURABAYA', 'JNT CARGO LAMPUNG', 'JNT EXPRESS PEKANBARU', 'JNT CARGO PKU', 'JNT JKM CARGO CAKUNG', 'JNT CARGO KOSAMBI', 'JNT PALANGKARAYA', 'MEDQUEST', 'PT BYAN BEKASI'];
const EMPLOYMENT_STATUSES = ['Freelance', 'Kontrak'];
const POSITIONS = ['Admin', 'Kordinator', 'Sorter', 'Driver', 'Kurir'];
const OWNERSHIP_STATUSES = ['PRIBADI', 'ORANG LAIN'];
const GENDERS = ['Laki-laki', 'Perempuan'];
const MARITAL_STATUSES = ['Menikah', 'Belum Menikah', 'Cerai Hidup', 'Cerai Mati'];
const RELIGIONS = ['Islam', 'Kristen', 'Protestan', 'Hindu', 'Buddha', 'Khonghucu'];
const PTKP_CODES = ['tk0', 'k1', 'k2', 'k3', 'tk1', 'tk2', 'tk3'];

function doGet() {
  try {
    return createResponse({ success: true, message: 'FORM PENGGAJIAN KARYAWAN API aktif' });
  } catch (error) {
    console.error(error);
    return createResponse({ success: false, message: 'Server error' });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;
    const payload = body.payload || {};
    verifyOrigin(payload.origin);
    rateLimit(payload.origin, action);

    if (action === 'validateBankAccount') {
      return createResponse(validateBankAccount(payload));
    }

    if (action === 'listProvinces') {
      return createResponse({ success: true, message: 'Success', data: fetchRegionalAll('/provinces', {}) });
    }

    if (action === 'listRegencies') {
      if (!/^\d{2}$/.test(payload.provinceCode || '')) throw new Error('Kode provinsi tidak valid');
      return createResponse({ success: true, message: 'Success', data: fetchRegionalAll('/provinces/' + payload.provinceCode + '/regencies', {}) });
    }

    if (action === 'listDistricts') {
      if (!/^\d{4}$/.test(payload.regencyCode || '')) throw new Error('Kode kabupaten/kota tidak valid');
      return createResponse({ success: true, message: 'Success', data: fetchRegionalAll('/regencies/' + payload.regencyCode + '/districts', {}) });
    }

    if (action === 'listVillages') {
      if (!/^\d{6}$/.test(payload.districtCode || '')) throw new Error('Kode kecamatan tidak valid');
      return createResponse({ success: true, message: 'Success', data: fetchRegionalAll('/districts/' + payload.districtCode + '/villages', {}) });
    }

    if (action === 'listBirthRegencies') {
      return createResponse({ success: true, message: 'Success', data: fetchRegionalAll('/regencies', {}) });
    }

    if (action === 'submitPayroll') {
      const result = handleSubmitPayroll(payload);
      return createResponse(result);
    }

    return createResponse({ success: false, message: 'Endpoint tidak dikenal' });
  } catch (error) {
    console.error(error);
    logSubmission('ERROR', '', error.message || String(error));
    return createResponse({ success: false, message: error.message || 'Server error' });
  }
}

function handleSubmitPayroll(payload) {
  if (sanitizeInput(payload.website || '') !== '') {
    throw new Error('Validation failed');
  }
  validateTimestamp(payload.submittedAt, payload.data && payload.data.formStartedAt);
  const data = validatePayload(payload.data || {});
  const backendValidation = validateBankAccount({
    origin: payload.origin,
    bank_code: data.bank.bank_code,
    bank_name: data.bank.bank_name,
    account_number: data.accountNumber,
    account_owner: data.accountOwner
  });

  if (!backendValidation.success || backendValidation.status !== 'VALID') {
    return { success: false, message: 'Rekening tidak valid' };
  }

  const submissionId = generateUUID();
  if (data.ownershipStatus === 'ORANG LAIN' && !(payload.files && payload.files.powerOfAttorney)) {
    throw new Error('Surat kuasa wajib diunggah');
  }

  const ktpFile = uploadToDrive(payload.files && payload.files.ktp, 'ktp', submissionId);
  const familyCardFile = uploadToDrive(payload.files && payload.files.familyCard, 'kartuKeluarga', submissionId);
  var suratKuasaFile = { url: '' };

  if (payload.files && payload.files.powerOfAttorney) {
    suratKuasaFile = uploadToDrive(payload.files.powerOfAttorney, 'suratKuasa', submissionId);
  }

  saveToSpreadsheet(submissionId, data, backendValidation, ktpFile.url, suratKuasaFile.url, familyCardFile.url);
  logSubmission('SUCCESS', submissionId, 'Data berhasil disimpan');

  return {
    success: true,
    submissionId: submissionId,
    message: 'Data berhasil disimpan'
  };
}

function validatePayload(data) {
  rejectUnknownFields(data, ALLOWED_FIELDS);
  if (!validateEmail(data.email)) throw new Error('Email tidak valid');
  if (!/^[A-Z ]+$/.test(data.fullName || '')) throw new Error('Nama lengkap tidak valid');
  if (!data.address || data.address.length < 10 || data.address.length > 500) throw new Error('Alamat tidak valid');
  if (!data.addressDetail || data.addressDetail.length < 5 || data.addressDetail.length > 200) throw new Error('Detail alamat tidak valid');
  if (!/^\d{2}$/.test(data.provinceCode || '') || !data.provinceName) throw new Error('Provinsi tidak valid');
  if (!/^\d{4}$/.test(data.regencyCode || '') || !data.regencyName) throw new Error('Kabupaten/kota tidak valid');
  if (!/^\d{6}$/.test(data.districtCode || '') || !data.districtName) throw new Error('Kecamatan tidak valid');
  if (!/^\d{10}$/.test(data.villageCode || '') || !data.villageName) throw new Error('Kelurahan/desa tidak valid');
  if (!/^\d{5}$/.test(data.postalCode || '')) throw new Error('Kode pos tidak valid');
  if (!validateNik(data.nik)) throw new Error('NIK tidak valid');
  if (!/^\d{4}$/.test(data.birthPlaceCode || '')) throw new Error('Kode tempat lahir tidak valid');
  if (!/^[A-Za-z .'\-()]+$/.test(data.birthPlace || '')) throw new Error('Tempat lahir wajib dipilih dari daftar');
  if (!/^[A-Za-z .'\-()]+$/.test(data.birthPlaceProvince || '')) throw new Error('Provinsi tempat lahir tidak valid');
  if (!/^\d{2}-\d{2}-\d{4}$/.test(data.birthDate || '')) throw new Error('Tanggal lahir tidak valid');
  if (isFutureDdMmYyyy(data.birthDate)) throw new Error('Tanggal lahir tidak boleh masa depan');
  if (GENDERS.indexOf(data.gender) === -1) throw new Error('Jenis kelamin tidak valid');
  if (MARITAL_STATUSES.indexOf(data.maritalStatus) === -1) throw new Error('Status pernikahan tidak valid');
  if (RELIGIONS.indexOf(data.religion) === -1) throw new Error('Agama tidak valid');
  if (PTKP_CODES.indexOf(data.ptkpCode) === -1) throw new Error('PTKP tidak valid');
  if (!validatePhone(data.phone)) throw new Error('Nomor telepon tidak valid');
  if (PLACEMENTS.indexOf(data.placement) === -1) throw new Error('Penempatan tidak valid');
  if (EMPLOYMENT_STATUSES.indexOf(data.employmentStatus) === -1) throw new Error('Status karyawan tidak valid');
  if (POSITIONS.indexOf(data.position) === -1) throw new Error('Posisi tidak valid');
  if (!/^\d{2}-\d{2}-\d{4}$/.test(data.firstWorkDate || '')) throw new Error('Tanggal kerja pertama tidak valid');
  if (!validateBank(data.bank)) throw new Error('Bank tidak valid');
  if (!/^\d{5,30}$/.test(data.accountNumber || '')) throw new Error('Nomor rekening tidak valid');
  if (!/^[A-Z ]+$/.test(data.accountOwner || '')) throw new Error('Nama pemilik rekening tidak valid');
  if (OWNERSHIP_STATUSES.indexOf(data.ownershipStatus) === -1) throw new Error('Status kepemilikan rekening tidak valid');

  return {
    email: sanitizeInput(data.email),
    fullName: sanitizeInput(data.fullName),
    address: sanitizeInput(data.address),
    addressDetail: sanitizeInput(data.addressDetail),
    provinceCode: sanitizeInput(data.provinceCode),
    provinceName: sanitizeInput(data.provinceName),
    regencyCode: sanitizeInput(data.regencyCode),
    regencyName: sanitizeInput(data.regencyName),
    districtCode: sanitizeInput(data.districtCode),
    districtName: sanitizeInput(data.districtName),
    villageCode: sanitizeInput(data.villageCode),
    villageName: sanitizeInput(data.villageName),
    postalCode: sanitizeInput(data.postalCode),
    nik: sanitizeInput(data.nik),
    birthPlaceCode: sanitizeInput(data.birthPlaceCode),
    birthPlace: sanitizeInput(data.birthPlace).toUpperCase(),
    birthPlaceProvince: sanitizeInput(data.birthPlaceProvince).toUpperCase(),
    birthDate: data.birthDate,
    gender: data.gender,
    maritalStatus: data.maritalStatus,
    religion: data.religion,
    ptkpCode: data.ptkpCode,
    phone: String(data.phone),
    placement: data.placement,
    employmentStatus: data.employmentStatus,
    position: data.position,
    firstWorkDate: data.firstWorkDate,
    bank: {
      bank_name: sanitizeInput(data.bank.bank_name),
      bank_code: sanitizeInput(data.bank.bank_code)
    },
    accountNumber: String(data.accountNumber),
    accountOwner: sanitizeInput(data.accountOwner),
    ownershipStatus: data.ownershipStatus
  };
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function validateNik(value) {
  return /^\d{16}$/.test(String(value || ''));
}

function validatePhone(value) {
  return /^\d{10,15}$/.test(String(value || ''));
}

function validateBank(bank) {
  return Boolean(bank && /^[a-z0-9_]+$/.test(bank.bank_code || '') && /^[A-Za-z0-9 .&()\/!-]+$/.test(bank.bank_name || ''));
}

function validateBankAccount(payload) {
  if (!validateBank({ bank_code: payload.bank_code, bank_name: payload.bank_name })) throw new Error('Bank tidak valid');
  if (!/^\d{5,30}$/.test(payload.account_number || '')) throw new Error('Nomor rekening tidak valid');
  if (!/^[A-Z ]+$/.test(payload.account_owner || '')) throw new Error('Nama pemilik rekening tidak valid');

  const apiKey = SCRIPT_PROPERTIES.getProperty('API_CO_ID_KEY');
  if (!apiKey) throw new Error('API_CO_ID_KEY belum diatur');

  const response = UrlFetchApp.fetch(API_CO_ID_URL, {
    method: 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: { 'x-api-co-id': apiKey },
    payload: JSON.stringify({
      bank_code: payload.bank_code,
      account_number: payload.account_number,
      account_name: payload.account_owner
    })
  });

  const code = response.getResponseCode();
  const parsed = JSON.parse(response.getContentText() || '{}');
  if (code < 200 || code >= 300) throw new Error('Validasi rekening gagal');

  const rawData = parsed.data || parsed;
  const score = Number(rawData.score || 0);
  const isValid = rawData.is_valid === true && score >= 7;
  const validationTimestamp = new Date().toISOString();

  return {
    success: true,
    message: isValid ? 'Rekening Valid' : 'Rekening Tidak Valid',
    status: isValid ? 'VALID' : 'INVALID',
    score: score,
    validatedName: sanitizeInput(rawData.name || rawData.account_name || rawData.validated_name || ''),
    validationTimestamp: validationTimestamp
  };
}

function fetchRegionalAll(path, params) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'regional:' + Utilities.base64EncodeWebSafe(path + ':' + JSON.stringify(params || {}));
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var page = 1;
  var totalPage = 1;
  var data = [];
  do {
    var response = fetchRegionalPage(path, Object.assign({}, params || {}, { page: page }));
    data = data.concat(response.data || []);
    totalPage = response.paging && response.paging.total_page ? Number(response.paging.total_page) : 1;
    page += 1;
  } while (page <= totalPage);

  cache.put(cacheKey, JSON.stringify(data), 21600);
  return data;
}

function fetchRegionalPage(path, params) {
  const apiKey = SCRIPT_PROPERTIES.getProperty('API_CO_ID_KEY');
  if (!apiKey) throw new Error('API_CO_ID_KEY belum diatur');

  const query = Object.keys(params || {}).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  const url = REGIONAL_API_BASE_URL + path + (query ? '?' + query : '');
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: { 'x-api-co-id': apiKey, Accept: 'application/json' }
  });
  const code = response.getResponseCode();
  const parsed = JSON.parse(response.getContentText() || '{}');
  if (code < 200 || code >= 300 || parsed.is_success === false) {
    throw new Error(parsed.message || 'Gagal mengambil data wilayah');
  }
  return parsed;
}

function sanitizeInput(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').replace(/[<>"'&`]/g, function (char) {
    return ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;', '`': '&#96;' })[char];
  });
}

function generateUUID() {
  return Utilities.getUuid();
}

function verifyOrigin(origin) {
  if (!origin || ALLOWED_ORIGINS.indexOf(origin) === -1) {
    throw new Error('Origin tidak diizinkan');
  }
  return true;
}

function rateLimit(origin, action) {
  const cache = CacheService.getScriptCache();
  const key = 'rate:' + Utilities.base64EncodeWebSafe(String(origin || 'unknown') + ':' + String(action || 'unknown'));
  const current = Number(cache.get(key) || '0');
  if (current >= 20) {
    throw new Error('Terlalu banyak permintaan. Coba lagi beberapa menit.');
  }
  cache.put(key, String(current + 1), 300);
}

function uploadToDrive(filePayload, type, submissionId) {
  if (!filePayload || !filePayload.base64) throw new Error('File wajib diunggah');
  const allowedMimeTypes = ALLOWED_MIME_TYPES[type];
  if (allowedMimeTypes.indexOf(filePayload.mimeType) === -1) throw new Error('MIME file tidak valid');
  if (Number(filePayload.size) > MAX_FILE_SIZE) throw new Error('Ukuran file melebihi 5MB');

  const bytes = Utilities.base64Decode(filePayload.base64);
  if (bytes.length > MAX_FILE_SIZE) throw new Error('Ukuran file melebihi 5MB');

  const extension = getExtension(filePayload.mimeType);
  const folderId = type === 'ktp' ? KTP_FOLDER_ID : (type === 'kartuKeluarga' ? KK_FOLDER_ID : SURAT_KUASA_FOLDER_ID);
  const fileName = submissionId + '-' + type + extension;
  const blob = Utilities.newBlob(bytes, filePayload.mimeType, fileName);
  const createdFile = DriveApp.getFolderById(folderId).createFile(blob);

  return {
    id: createdFile.getId(),
    url: createdFile.getUrl()
  };
}

function saveToSpreadsheet(submissionId, data, validation, ktpUrl, suratKuasaUrl, familyCardUrl) {
  const row = buildSubmissionRow(submissionId, data, validation, ktpUrl, suratKuasaUrl, familyCardUrl);
  const mainSheet = getSheet(SHEET_NAME);
  createSpreadsheetHeaders();
  mainSheet.appendRow(row);
  applyDuplicateNikFormattingToSheet(mainSheet);

  const placementSheet = getSheet(getPlacementSheetName(data.placement));
  createSpreadsheetHeadersForSheet(placementSheet);
  placementSheet.appendRow(row);
  applyDuplicateNikFormattingToSheet(placementSheet);
}

function buildSubmissionRow(submissionId, data, validation, ktpUrl, suratKuasaUrl, familyCardUrl) {
  return [
    submissionId,
    new Date(),
    data.email,
    data.fullName,
    data.address,
    "'" + data.nik,
    data.birthPlace,
    data.birthDate,
    "'" + data.phone,
    data.gender,
    data.maritalStatus,
    data.religion,
    data.ptkpCode,
    data.placement,
    data.employmentStatus,
    data.position,
    data.firstWorkDate,
    data.bank.bank_name,
    data.bank.bank_code,
    "'" + data.accountNumber,
    data.accountOwner,
    validation.status,
    validation.score,
    validation.validatedName,
    validation.validationTimestamp,
    data.ownershipStatus,
    ktpUrl,
    suratKuasaUrl,
    familyCardUrl
  ];
}

function getPlacementSheetName(placement) {
  return String(placement || 'UNKNOWN')
    .replace(/[\[\]\*\/\\\?:]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100) || 'UNKNOWN';
}

function createSpreadsheetHeaders() {
  const sheet = getSheet(SHEET_NAME);
  createSpreadsheetHeadersForSheet(sheet);
}

function createSpreadsheetHeadersForSheet(sheet) {
  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const existingColumnCount = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet.getRange(1, 1, 1, existingColumnCount).getValues()[0];
  if (existing.join('|') !== HEADERS.join('|')) {
    const lastRow = sheet.getLastRow();
    const existingRows = lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, existingColumnCount).getValues()
      : [];
    const headerIndexes = {};
    existing.forEach(function (header, index) {
      if (header && headerIndexes[header] === undefined) headerIndexes[header] = index;
    });
    const reorderedRows = existingRows.map(function (row) {
      return HEADERS.map(function (header) {
        const index = headerIndexes[header];
        return index === undefined ? '' : row[index];
      });
    });

    sheet.getRange(1, 1, lastRow, Math.max(existingColumnCount, HEADERS.length)).clearContent();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    if (reorderedRows.length > 0) {
      sheet.getRange(2, 1, reorderedRows.length, HEADERS.length).setValues(reorderedRows);
    }
  }
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function logSubmission(status, submissionId, message) {
  try {
    const sheet = getSheet(AUDIT_SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Created At', 'Status', 'Submission ID', 'Message']);
    }
    sheet.appendRow([new Date(), status, submissionId, String(message || '')]);
  } catch (error) {
    console.error(error);
  }
}

function getSheet(name) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID belum diatur');
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function rejectUnknownFields(object, allowedFields) {
  Object.keys(object || {}).forEach(function (key) {
    if (allowedFields.indexOf(key) === -1) {
      throw new Error('Field tidak dikenal: ' + key);
    }
  });
}

function validateTimestamp(submittedAt, formStartedAt) {
  const submitted = new Date(submittedAt).getTime();
  const started = new Date(formStartedAt).getTime();
  const now = Date.now();
  if (!submitted || !started || Math.abs(now - submitted) > 10 * 60 * 1000 || submitted < started || submitted - started < 1500) {
    throw new Error('Timestamp tidak valid');
  }
}

function isFutureDdMmYyyy(value) {
  const parts = String(value || '').split('-');
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() > today.getTime();
}

function getExtension(mimeType) {
  if (mimeType === 'application/pdf') return '.pdf';
  if (mimeType === 'image/png') return '.png';
  return '.jpg';
}
