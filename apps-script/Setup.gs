function setup() {
  createSpreadsheetHeaders();
  applyDuplicateNikFormatting();
  DriveApp.getFolderById(KTP_FOLDER_ID);
  DriveApp.getFolderById(SURAT_KUASA_FOLDER_ID);
  console.log('Setup berhasil: header spreadsheet, format duplikat NIK, dan folder Drive valid.');
}

function applyDuplicateNikFormatting() {
  const sheet = getSheet(SHEET_NAME);
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
