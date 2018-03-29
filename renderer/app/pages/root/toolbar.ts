import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LayoutStateModel } from '../../state/layout';
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

  @Input() layout = {} as LayoutStateModel;
  @Input() prefs = {} as PrefsStateModel;

  @Output() connect = new EventEmitter<any>();
  @Output() disconnect = new EventEmitter<any>();
  @Output() openPrefs = new EventEmitter<any>();
  @Output() showHelp = new EventEmitter<any>();
  @Output() showKeyboard = new EventEmitter<boolean>();

}
