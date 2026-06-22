function setup() {
  createSpreadsheetHeaders();
  createPlacementSheets();
  syncPlacementSheetsFromMain();
  applyDuplicateNikFormattingToPayrollSheets();
  DriveApp.getFolderById(KTP_FOLDER_ID);
  DriveApp.getFolderById(KK_FOLDER_ID);
  DriveApp.getFolderById(SURAT_KUASA_FOLDER_ID);
  console.log('Setup berhasil: header spreadsheet, sinkronisasi sheet penempatan, format duplikat NIK, dan folder Drive valid.');
}

function createPlacementSheets() {
  PLACEMENTS.forEach(function (placement) {
    const sheet = getSheet(getPlacementSheetName(placement));
    createSpreadsheetHeadersForSheet(sheet);
  });
}

function syncPlacementSheetsFromMain() {
  const mainSheet = getSheet(SHEET_NAME);
  const lastRow = mainSheet.getLastRow();
  const rows = lastRow > 1 ? mainSheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues() : [];

  PLACEMENTS.forEach(function (placement) {
    const placementName = getPlacementSheetName(placement);
    const sheet = getSheet(placementName);
    createSpreadsheetHeadersForSheet(sheet);

    if (sheet.getMaxRows() > 1) {
      sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length).clearContent();
    }

    const placementRows = rows.filter(function (row) {
      return String(row[9] || '').trim() === placement;
    });

    if (placementRows.length > 0) {
      sheet.getRange(2, 1, placementRows.length, HEADERS.length).setValues(placementRows);
    }
  });
}

function applyDuplicateNikFormattingToPayrollSheets() {
  applyDuplicateNikFormattingToSheet(getSheet(SHEET_NAME));
  PLACEMENTS.forEach(function (placement) {
    applyDuplicateNikFormattingToSheet(getSheet(getPlacementSheetName(placement)));
  });
}

function applyDuplicateNikFormattingToSheet(sheet) {
  const dataRange = sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), HEADERS.length);
  const duplicateNikFormula = '=AND($F2<>"",COUNTIF($F:$F,$F2)>1)';

  const preservedRules = sheet.getConditionalFormatRules().filter(function (rule) {
    const condition = rule.getBooleanCondition();
    if (!condition || condition.getCriteriaType() !== SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA) {
      return true;
    }
    const criteriaValues = condition.getCriteriaValues();
    return criteriaValues[0] !== duplicateNikFormula;
  });

  const duplicateNikRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(duplicateNikFormula)
    .setBackground('#f4cccc')
    .setFontColor('#990000')
    .setRanges([dataRange])
    .build();

  preservedRules.push(duplicateNikRule);
  sheet.setConditionalFormatRules(preservedRules);
}
