import { BrowserWindow, app, dialog, ipcMain } from 'electron';

import { Subscription } from 'rxjs/Subscription';
import { Tn3270 } from 'tn3270/lib/tn3270';

require('electron-capture');
const fs = require('fs');

/**
 * Electron event dispatcher
 */

let theConnection: Subscription;
let theWindow: BrowserWindow;
let theTn3270: Tn3270;

app.on('ready', () => {
  theWindow = new BrowserWindow({
    width: 832,
    height: 1024,
    resizable: true,
    webPreferences: {
      // TODO: very temporary -- we remove /dist
      preload: __dirname.substring(0, __dirname.length - 5) + '/node_modules/electron-capture/src/preload.js'
    }
  });
  // TODO: also temporary -- not deploying from dist to get hot reload
  theWindow.loadURL('http://localhost:4200');
  theWindow.setMenu(null);
  theWindow.webContents.openDevTools();
  theWindow.on('blur', () => {
    theWindow.webContents.send('focused', false);
  });
  theWindow.on('close', () => {
    if (theConnection)
      theConnection.unsubscribe();
    theConnection = null;
  });
  theWindow.on('focus', () => {
    theWindow.webContents.send('focused', true);
  });
});

app.on('window-all-closed', () => {
  if (theConnection)
    theConnection.unsubscribe();
  app.quit();
});

ipcMain.on('print', (event: any) => {
  dialog.showSaveDialog(theWindow, {
    filters: [
      {name: 'PNG Files', extensions: ['png']},
    ],
    title: 'Save EL-3270 Screen Image'
  }, filename => {
    if (filename) {
      theWindow['captureFullPage']((imageStream) => {
        imageStream.pipe(fs.createWriteStream(filename));
      });
    }
  });
});

ipcMain.on('connect', (event: any,
                       host: string,
                       port: number,
                       model: string) => {
  theTn3270 = new Tn3270(host, port, model);
  let sequence = 0;
  theConnection = theTn3270.stream$.subscribe({
    next: (data: Buffer) => {
      // YES -- I know this is crap
      if (sequence++ === 0)
        theWindow.webContents.send('connected');
      const view = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++)
        view[i] = data[i];
      theWindow.webContents.send('data', view);
    },
    error: (error: Error) => theWindow.webContents.send('error', error.message),
    complete: () => theWindow.webContents.send('disconnected')
  });
});

ipcMain.on('disconnect', () => {
  if (theConnection) {
    theWindow.webContents.send('disconnected');
    theConnection.unsubscribe();
    theConnection = null;
  }
});

ipcMain.on('write', (event: any,
                     data: Uint8Array) => {
  theTn3270.write(data);
});
