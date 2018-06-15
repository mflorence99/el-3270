import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutState } from '../../state/layout';
import { LayoutStateModel } from '../../state/layout';
import { Observable } from 'rxjs/Observable';
import { PrefsState } from '../../state/prefs';
import { PrefsStateModel } from '../../state/prefs';
import { ScreenState } from '../../state/screen';
import { ScreenStateModel } from '../../state/screen';
import { Select } from '@ngxs/store';
import { StatusState } from '../../state/status';
import { StatusStateModel } from '../../state/status';

/**
 * LU3270 controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-lu3270-ctrl',
  styles: [':host { display: none; }'],
  template: ''
})

export class LU3270CtrlComponent {

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;
  @Select(ScreenState) screen$: Observable<ScreenStateModel>;
  @Select(StatusState) status$: Observable<StatusStateModel>;

}
