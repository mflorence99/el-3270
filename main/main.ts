import { BrowserWindow, app, ipcMain } from 'electron';

import { Subscription } from 'rxjs/Subscription';
import { Tn3270 } from 'tn3270/lib/tn3270';

/**
 * Electron event dispatcher
 */

let theConnection: Subscription;
let theWindow: BrowserWindow;
let theTn3270: Tn3270;

app.on('ready', () => {
  theWindow = new BrowserWindow({width: 832, height: 1024});
  theWindow.loadURL('http://localhost:4200');
  // theWindow.setMenu(null);
  theWindow.webContents.openDevTools();
  theWindow.on('close', () => {
    if (theConnection)
      theConnection.unsubscribe();
    theConnection = null;
  });
});

app.on('window-all-closed', () => {
  if (theConnection)
    theConnection.unsubscribe();
  app.quit();
});

ipcMain.on('connect', (event: any,
                       host: string,
                       port: number,
                       model: string) => {
  theTn3270 = new Tn3270(host, port, model);
  let sequence = 0;
  theConnection = theTn3270.stream$.subscribe({
    next: (data: Buffer) => {
      // YES -- I know this is crap!
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

ipcMain.on('submit', (event: any,
                      data: Uint8Array) => {
  theTn3270.write(data);
});
