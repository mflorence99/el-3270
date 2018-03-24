import { Cell } from 'tn3270/lib';
import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';

/**
 * All the is experimental
 */

@Component({
  selector: 'el3270-root',
  templateUrl: 'el3270.html',
  styleUrls: ['el3270.less']
})

export class EL3270Component {

  constructor(private electron: ElectronService) {
    this.electron.ipcRenderer.on('outbound',
      (event: any, buffer: Cell[], cursor: number) => {
      console.log(buffer);
    });
  }

  connect() {
    this.electron.ipcRenderer.send('connect', 'localhost', 3270, 'IBM-3278-4-E', 80, 43);
  }

  disconnect() {
    this.electron.ipcRenderer.send('disconnect');
  }

}
