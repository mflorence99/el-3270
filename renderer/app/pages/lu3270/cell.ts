import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Screen cell component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-cell',
  styleUrls: ['cell.scss'],
  templateUrl: 'cell.html'
})

export class CellComponent {

}
