function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('My Web App');
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function serverTime() {
  return new Date().toString();
}

