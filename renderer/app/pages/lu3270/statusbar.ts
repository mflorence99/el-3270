import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';

import { PrefsStateModel } from '../../state/prefs';
import { ScreenStateModel } from '../../state/screen';
import { StatusStateModel } from '../../state/status';

/**
 * Status bar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-statusbar',
  styleUrls: ['statusbar.scss'],
  templateUrl: 'statusbar.html'
})

export class StatusbarComponent  {

  @Input() prefs = {} as PrefsStateModel;
  @Input() screen = {} as ScreenStateModel;
  @Input() status = {} as StatusStateModel;

  /** ctor */
  constructor(private element: ElementRef) { }

  /** Compute colimn from cursor */
  colNum(): number {
    return (this.status.cursorAt % this.prefs.numCols) + 1;
  }

  /** Compute row from cursor */
  rowNum(): number {
    return Math.trunc(this.status.cursorAt / this.prefs.numCols) + 1;
  }

  // bind OnChange handlers

  fontSize(fontSize: string) {
    const el = this.element.nativeElement;
    el.style.fontSize = fontSize;
  }

}
