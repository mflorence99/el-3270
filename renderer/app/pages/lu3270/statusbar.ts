import { ChangeDetectionStrategy, Component } from '@angular/core';

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

}
