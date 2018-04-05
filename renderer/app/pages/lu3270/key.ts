import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

/**
 * Keyboard key component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-key',
  styleUrls: ['key.scss'],
  templateUrl: 'key.html'
})

export class KeyComponent {

  @HostBinding('class.disabled') @Input() disabled: boolean;
  @HostBinding('class.short') @Input() short: boolean;

  @Input() label: string;

}
