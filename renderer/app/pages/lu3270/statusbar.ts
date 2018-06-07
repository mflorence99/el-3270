import { Alarm, StatusStateModel } from '../../state/status';
import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LifecycleComponent, OnChange } from 'ellib';

import { PrefsStateModel } from '../../state/prefs';
import { ScreenStateModel } from '../../state/screen';
import { Store } from '@ngxs/store';

/**
 * Status bar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-statusbar',
  styleUrls: ['statusbar.scss'],
  templateUrl: 'statusbar.html'
})

export class StatusbarComponent extends LifecycleComponent {

  @Input() prefs = { } as PrefsStateModel;
  @Input() screen = { } as ScreenStateModel;
  @Input() status = { } as StatusStateModel;

  @ViewChild('ding') ding;

  /** ctor */
  constructor(private element: ElementRef,
              private store: Store) {
    super();
  }

  /** Compute colimn from cursor */
  colNum(): number {
    return (this.status.cursorAt % this.prefs.numCols) + 1;
  }

  /** Compute row from cursor */
  rowNum(): number {
    return Math.trunc(this.status.cursorAt / this.prefs.numCols) + 1;
  }

  /** Font size change reported */
  fontSize(fontSize: string) {
    const el = this.element.nativeElement;
    el.style.fontSize = fontSize;
  }

  // bind OnChange handlers

  @OnChange('status') soundAlarm() {
    if (this.status && this.ding.nativeElement) {
      if (this.status.alarm) {
        this.ding.nativeElement
          .play()
          .then(() => this.store.dispatch(new Alarm(false)));
      }
    }
  }

}
