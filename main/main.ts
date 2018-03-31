import { BrowserWindow, app, ipcMain } from 'electron';

import { Subscription } from 'rxjs/Subscription';
import { Tn3270 } from 'tn3270/lib';

/**
 * All the is experimental
 */

let theConnection: Subscription;
let theWindow: BrowserWindow;

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
  const tn3270 = new Tn3270(host, port, model);
  theConnection = tn3270.stream$.subscribe({
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
