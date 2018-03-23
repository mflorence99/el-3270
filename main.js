const {
  app,
  BrowserWindow
} = require('electron');

let theWindow;

app.on('ready', function () {
  theWindow = new BrowserWindow({frame: 'false'});
  theWindow.loadURL('http://localhost:4200');
  theWindow.setMenu(null);
  theWindow.on('closed', function () {
    theWindow = null;
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
