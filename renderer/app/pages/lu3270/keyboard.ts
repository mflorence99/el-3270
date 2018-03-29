import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { LayoutStateModel } from '../../state/layout';
import { LifecycleComponent } from 'ellib/lib/components/lifecycle';
import { OnChange } from 'ellib/lib/decorators/onchange';

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

  // bind OnChange handlers

  @OnChange('layout') showKeyboard() {
    this.maxHeight = (this.layout && this.layout.showKeyboard)? '144px' : '0';
  }

}
