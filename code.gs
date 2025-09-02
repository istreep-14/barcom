function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'Home';
  var tpl = HtmlService.createTemplateFromFile('Index');
  tpl.page = page;
  return tpl.evaluate()
    .setTitle('Bar Combined App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// Sheets helpers for Shifts page
function getShiftsSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('Shifts');
  if (!sheet) {
    sheet = ss.insertSheet('Shifts');
    sheet.appendRow(['id','date','startTime','endTime','hours','location','tips','tipsPerHour','notes']);
  }
  return sheet;
}

function getAllShifts() {
  var sheet = getShiftsSheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  return values.slice(1).map(function(row) {
    var o = {};
    headers.forEach(function(h, i) { o[h] = row[i]; });
    o.tips = parseFloat(o.tips) || 0;
    o.hours = parseFloat(o.hours) || 0;
    o.tipsPerHour = parseFloat(o.tipsPerHour) || 0;
    return o;
  });
}

function addShift(shift) {
  var sheet = getShiftsSheet_();
  var hours = computeHours_(shift.date, shift.startTime, shift.endTime);
  var tipsPerHour = hours > 0 ? (Number(shift.tips) / hours) : 0;
  sheet.appendRow([
    shift.id, shift.date, shift.startTime, shift.endTime, hours,
    shift.location, Number(shift.tips), tipsPerHour, shift.notes || ''
  ]);
  return { ok: true };
}

function updateShift(shift) {
  var sheet = getShiftsSheet_();
  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === shift.id) {
      var hours = computeHours_(shift.date, shift.startTime, shift.endTime);
      var tipsPerHour = hours > 0 ? (Number(shift.tips) / hours) : 0;
      sheet.getRange(r + 1, 1, 1, 9).setValues([[
        shift.id, shift.date, shift.startTime, shift.endTime, hours,
        shift.location, Number(shift.tips), tipsPerHour, shift.notes || ''
      ]]);
      return { ok: true };
    }
  }
  throw new Error('Shift not found: ' + shift.id);
}

function deleteShift(id) {
  var sheet = getShiftsSheet_();
  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === id) {
      sheet.deleteRow(r + 1);
      return { ok: true };
    }
  }
  throw new Error('Shift not found: ' + id);
}

function testSetup() {
  getShiftsSheet_();
  return { ok: true };
}

function computeHours_(date, startTime, endTime) {
  if (!date || !startTime || !endTime) return 0;
  var start = new Date(date + 'T' + startTime);
  var end = new Date(date + 'T' + endTime);
  if (end < start) end.setDate(end.getDate() + 1);
  return (end - start) / (1000 * 60 * 60);
}
