import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LayoutState, LayoutStateModel, ShowKeyboard } from '../../state/layout';
import { PrefsState, PrefsStateModel, UpdatePrefs } from '../../state/prefs';
import { Select, Store } from '@ngxs/store';

import { LifecycleComponent } from 'ellib/lib/components/lifecycle';
import { Observable } from 'rxjs/Observable';
import { OnChange } from 'ellib/lib/decorators/onchange';
import { Router } from '@angular/router';

/**
 * Root controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-root-ctrl',
  template: ''
})

export class RootCtrlComponent extends LifecycleComponent {

  @Input() prefs = {} as PrefsStateModel;

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;

  /** ctor */
  constructor(private router: Router,
              private store: Store) {
    super();
  }

  /** Connect to host */
  connect() {
    this.router.navigate(['lu3270']);
  }

  /** Disconnect from host */
  disconnect() {

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

  @OnChange('prefs') savePrefs() {
    if (this.prefs && this.prefs.submitted)
      this.store.dispatch(new UpdatePrefs(this.prefs));
  }

}
