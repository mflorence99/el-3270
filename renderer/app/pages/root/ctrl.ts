import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LayoutState, LayoutStateModel, ShowKeyboard } from '../../state/layout';
import { PrefsState, PrefsStateModel, UpdatePrefs } from '../../state/prefs';
import { Select, Store } from '@ngxs/store';

import { LU3270Service } from '../../services/lu3270';
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
  styles: [':host { display: none; }'],
  template: ''
})

export class RootCtrlComponent extends LifecycleComponent {

  @Input() prefsForm = {} as PrefsStateModel;

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;

  /** ctor */
  constructor(private lu3270: LU3270Service,
              private router: Router,
              private store: Store) {
    super();
  }

  /** Connect to host */
  connect() {
    this.prefs$.subscribe((prefs: PrefsStateModel) => {
      this.lu3270.connect(prefs.host, prefs.port, prefs.model);
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
    if (this.prefsForm && this.prefsForm.submitted)
      this.store.dispatch(new UpdatePrefs(this.prefsForm));
  }

}
