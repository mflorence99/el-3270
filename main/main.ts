import { BrowserWindow, app, ipcMain } from 'electron';

import { LU3270 } from 'tn3270/lib';

/**
 * All the is experimental
 */

let theLU3270: LU3270, theWindow: BrowserWindow;

app.on('ready', () => {
  theWindow = new BrowserWindow({width: 832, height: 1024});
  theWindow.loadURL('http://localhost:4200');
  // theWindow.setMenu(null);
  theWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('connect', (event: any,
                       host: string,
                       port: number,
                       model: string,
                       numCols: number,
                       numRows: number) => {
  theLU3270 = new LU3270(host, port, model, numCols, numRows);
  theLU3270.on('outbound', () => {
    theWindow.webContents.send('outbound', theLU3270.buffer, theLU3270.cursor);
  });
  theLU3270.connect();
});

ipcMain.on('disconnect', () => {
  theLU3270.disconnect();
});
