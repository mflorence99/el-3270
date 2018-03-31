import { BrowserWindow, app, ipcMain } from 'electron';

import { Subscription } from 'rxjs/Subscription';
import { Tn3270 } from 'tn3270/lib/tn3270';

/**
 * All the is experimental
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
  });
});

app.on('window-all-closed', () => {
  theConnection.unsubscribe();
  app.quit();
});

ipcMain.on('connect', (event: any,
                       host: string,
                       port: number,
                       model: string) => {
  theTn3270 = new Tn3270(host, port, model);
  theConnection = theTn3270.stream$.subscribe({
      next: (data: Buffer) => {
        const view = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++)
          view[i] = data[i];
        theWindow.webContents.send('data', view);
      },
      error: (error: Error) => theWindow.webContents.send('error', error.message)
  });
});

ipcMain.on('disconnect', () => {
  theConnection.unsubscribe();
});

ipcMain.on('submit', (data: Uint8Array) => {
  // const buffer = new Buffer(data.length);
  // for (let i = 0; i < data.length; i++)
  //   buffer[i] = data[i];
  theTn3270.write([0x7d, 0x5b, 0xf1, 0x11, 0x5b, 0x6b, 0xc8, 0xc5, 0xd9, 0xc3, 0xf0, 0xf1, 0xFF, 0xEF]);
});
