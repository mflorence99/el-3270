import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PrefsStateModel } from '../../state/prefs';

/**
 * Status bar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-statusbar',
  styleUrls: ['statusbar.scss'],
  templateUrl: 'statusbar.html'
})

export class StatusbarComponent {

  @Input() prefs = {} as PrefsStateModel;

}
