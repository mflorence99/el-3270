import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LayoutState, LayoutStateModel, ShowKeyboard } from '../../state/layout';
import { LifecycleComponent, OnChange, debounce, nextTick } from 'ellib';
import { PrefsState, PrefsStateModel, UpdatePrefs } from '../../state/prefs';
import { Select, Store } from '@ngxs/store';
import { WindowState, WindowStateModel } from '../../state/window';

import { ElectronService } from 'ngx-electron';
import { LU3270Service } from '../../services/lu3270';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { SetBounds } from '../../state/window';
import { config } from '../../config';
import { take } from 'rxjs/operators';

/**
 * Root controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-root-ctrl',
  styles: [':host { display: none; }'],
  template: ''
})

export class RootCtrlComponent extends LifecycleComponent {

  @Input() prefsForm = { } as PrefsStateModel;

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;
  @Select(WindowState) window$: Observable<WindowStateModel>;

  /** ctor */
  constructor(private electron: ElectronService,
              private lu3270: LU3270Service,
              private router: Router,
              private store: Store) {
    super();
    // set the initial bounds
    this.window$.pipe(take(1))
      .subscribe((window: WindowStateModel) => {
        const win = this.electron.remote.getCurrentWindow();
        if (window.bounds)
          win.setBounds(window.bounds);
      });
    // record the bounds when they change
    this.electron.ipcRenderer.on('bounds', debounce((event, bounds) => {
      this.store.dispatch(new SetBounds(bounds));
    }, config.setBoundsThrottle));
  }

  /** Connect to host */
  connect() {
    this.prefs$.subscribe((prefs: PrefsStateModel) => {
      this.lu3270.connect(prefs.host, prefs.port, prefs.model, prefs.numCols, prefs.numRows);
      this.router.navigate(['lu3270']);
    });
  }

  /** Disconnect from host */
  disconnect() {
    this.lu3270.disconnect();
  }

  /**  Show help panel */
  showHelp() {
    this.router.navigate(['help']);
  }

  /**  Show keyboard */
  showKeyboard(state: boolean) {
    this.store.dispatch(new ShowKeyboard(state));
  }

  // bind OnChange handlers

  @OnChange('prefsForm') savePrefs() {
    if (this.prefsForm && this.prefsForm.submitted) {
      // TODO: why do we need this in Electron? and only running live?
      // at worst, running in NgZone should work -- but otherwise a DOM
      // event is necessary to force change detection
      nextTick(() => {
        this.store.dispatch(new UpdatePrefs(this.prefsForm));
      });
    }
  }

}
