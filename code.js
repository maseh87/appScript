/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var schedule = sheet.getSheetByName('Schedule');
  var matchesSheet = sheet.getSheetByName('Matches');
  var roundSchedule = sheet.getRangeByName("roundSchedule");
function test() {
  // Get the range of cells that store employee data.
  var roundSchedule = sheet.getRangeByName("roundSchedule");

  // For every row of employee data, generate an employee object.
  var employeeObjects = getColumnsData(sheet, roundSchedule);
  Logger.log(employeeObjects);
};

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}


// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}


// Given a JavaScript 2d Array, this function returns the transposed table.
// Arguments:
//   - data: JavaScript 2d Array
// Returns a JavaScript 2d Array
// Example: arrayTranspose([[1,2,3],[4,5,6]]) returns [[1,4],[2,5],[3,6]].
function arrayTranspose(data) {
  if (data.length == 0 || data[0].length == 0) {
    return null;
  }

  var ret = [];
  for (var i = 0; i < data[0].length; ++i) {
    ret.push([]);
  }

  for (var i = 0; i < data.length; ++i) {
    for (var j = 0; j < data[i].length; ++j) {
      ret[j][i] = data[i][j];
    }
  }

  return ret;
}


// getColumnsData iterates column by column in the input range and returns an array of objects.
// Each object contains all the data for a given column, indexed by its normalized row name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - rowHeadersColumnIndex: specifies the column number where the row names are stored.
//       This argument is optional and it defaults to the column immediately left of the range;
// Returns an Array of objects.
function getColumnsData(sheet, range, rowHeadersColumnIndex) {
  rowHeadersColumnIndex = rowHeadersColumnIndex || range.getColumnIndex() - 1;
  var headersTmp = schedule.getRange(range.getRow(), rowHeadersColumnIndex, range.getNumRows(), 1).getValues();
  var headers = normalizeHeaders(arrayTranspose(headersTmp)[0]);
  return getObjects(arrayTranspose(range.getValues()),headers);
};












//function checkCompanyBreaks() {
//  var range = sheet.getRange("O2:O37"); //need to allow it to work no matter the size of the sheet
//  var height = range.getHeight();
//  //check the break column and highlight breaks numbers
//  for (var i = 1; i <= height; i++) {
//    Logger.log(range.getCell(i,1).getValue());
//    if(range.getCell(i,1).getValue() >= 6) {
//      range.getCell(i,1).setBackground('red');
//    } else if(range.getCell(i,1).getValue() === 4 || range.getCell(i,1).getValue() === 5) {
//      range.getCell(i,1).setBackground('orange');
//    } else {
//      range.getCell(i,1).setBackground('green');
//    }
//  };
//};
//compare both sheets and highlight red if it should be scheduled and it isn't
function compareSheets(){
  Logger.log(typeof matchesSheet);
  var selectedCol = "B2:B37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");
    }
    else if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    else if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    } else {
      cell.setBackground('white');
      cell.clearNote();
    }
  }
};

function cCol(){
  var selectedCol = "C2:C37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");

    }
    if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    }
  }
};

function dCol(){
  var selectedCol = "D2:D37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");

    }
    if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    }
  }
};
function eCol(){
  var selectedCol = "E2:E37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");

    }
    if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    }
  }
};
function fCol(){
  var selectedCol = "F2:F37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");

    }
    if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    }
  }
};
function gCol(){
  var selectedCol = "G2:G37";
  var scheduleColumn = schedule.getRange(selectedCol);
  var matchColumn = matchesSheet.getRange(selectedCol);
  var height = scheduleColumn.getHeight();
  for(var j = 1; j < height; j++){
    var cell = scheduleColumn.getCell(j,1);
    if(matchColumn.getCell(j,1).getValue() === 4 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('red');
      cell.setNote("User rated this company a 4 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 3 && typeof scheduleColumn.getCell(j,1).getValue() !== 'number') {
      cell.setBackground('orange');
      cell.setNote("User rated this company a 3 and didn't get a scheduled slot");
    }
    if(matchColumn.getCell(j,1).getValue() === 1 && typeof scheduleColumn.getCell(j,1).getValue() === 'number'){
      cell.setBackground('yellow');
      cell.setNote('User rated this company a 1 and got scheduled. Recommend switching');
    }
  }
};


function onEdit(e) {
  Logger.log(e);
//  checkCompanyBreaks();
  compareSheets();
  cCol();
  dCol();
  eCol();
  fCol();
  gCol();
}

function doGet() {
   var app = UiApp.createApplication();
   // Create a popup panel and set it to be modal.
   var popupPanel = app.createPopupPanel(false, true);
   // Add a button to the panel and set the dimensions and position.
   popupPanel.add(app.createButton()).setWidth("100px").setHeight("100px")
       .setPopupPosition(100, 100);
   // Show the panel. Note that it does not have to be "added" to the UiInstance.
   popupPanel.show();
   sheet.show(app);
};




/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */


//function onOpen() {

//};
