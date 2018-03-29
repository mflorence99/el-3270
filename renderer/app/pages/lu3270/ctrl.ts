import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutState, LayoutStateModel } from '../../state/layout';
import { PrefsState, PrefsStateModel } from '../../state/prefs';

import { Observable } from 'rxjs/Observable';
import { Select } from '@ngxs/store';

/**
 * LU3270 controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-lu3270-ctrl',
  template: ''
})

export class LU3270CtrlComponent {

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;

}
