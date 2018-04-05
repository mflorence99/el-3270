import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { AID } from '../../services/types';
import { LU3270Service } from '../../services/lu3270';
import { LayoutStateModel } from '../../state/layout';
import { LifecycleComponent } from 'ellib/lib/components/lifecycle';
import { OnChange } from 'ellib/lib/decorators/onchange';
import { ScreenStateModel } from '../../state/screen';
import { StatusStateModel } from '../../state/status';

/**
 * Keyboard component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-keyboard',
  styleUrls: ['keyboard.scss'],
  templateUrl: 'keyboard.html'
})

export class KeyboardComponent extends LifecycleComponent {

  @HostBinding('style.maxHeight') maxHeight: string;

  @Input() layout = {} as LayoutStateModel;
  @Input() screen = {} as ScreenStateModel;
  @Input() status = {} as StatusStateModel;

  /** ctor */
  constructor(private lu3270: LU3270Service) {
    super();
  }

  /** Handle simulated key */
  aid(code: string) {
    if (code && this.status.connected) {
      if (code === 'PRINT')
        this.lu3270.print();
      else this.lu3270.submit(AID[code], this.status.cursorAt, this.screen.cells);
    }
  }

  // bind OnChange handlers

  @OnChange('layout') showKeyboard() {
    this.maxHeight = (this.layout && this.layout.showKeyboard)? '144px' : '0';
  }

}
