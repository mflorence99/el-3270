import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { LayoutStateModel } from '../../state/layout';
import { Output } from '@angular/core';
import { PrefsStateModel } from '../../state/prefs';

/**
 * Toolbar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.scss']
})

export class ToolbarComponent {

  @Input() layout = { } as LayoutStateModel;
  @Input() prefs = { } as PrefsStateModel;

  @Output() connect = new EventEmitter<any>();
  @Output() disconnect = new EventEmitter<any>();
  @Output() openPrefs = new EventEmitter<any>();
  @Output() showHelp = new EventEmitter<any>();
  @Output() showKeyboard = new EventEmitter<boolean>();

  /** ctor */
  constructor(private electron: ElectronService) { }

  /** Open dev tools */
  devTools() {
    const win = this.electron.remote.getCurrentWindow();
    win.webContents.openDevTools();
  }

  /** Reload app */
  reload() {
    const win = this.electron.remote.getCurrentWindow();
    win.webContents.reload();
  }

}
