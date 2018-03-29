import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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

  @Input() label: string;

}
