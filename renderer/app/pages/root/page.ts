import { FormBuilder, FormGroup } from '@angular/forms';

import { Cell } from 'tn3270/lib';
import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { EventEmitter } from '@angular/core';

/**
 * All this is experimental
 */

@Component({
  selector: 'el3270-root',
  templateUrl: 'page.html',
  styleUrls: ['page.scss']
})

export class RootPageComponent {

  theForm: FormGroup;

  constructor(private electron: ElectronService,
              private fb: FormBuilder) {
    this.electron.ipcRenderer.on('outbound',
      (event: any, buffer: Cell[], cursor: number) => {
      console.log(buffer);
    });
    this.theForm = this.fb.group({
      checkbox: false,
      input: ''
    });
  }

  connect() {
    this.electron.ipcRenderer.send('connect', 'localhost', 3270, 'IBM-3278-4-E', 80, 43);
  }

  disconnect() {
    this.electron.ipcRenderer.send('disconnect');
  }

  xxx() {
    const v = this.theForm.valueChanges as EventEmitter<any>;
    v.emit({ ...this.theForm.value, submitted: true });
  }

}
