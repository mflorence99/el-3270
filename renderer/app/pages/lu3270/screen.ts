import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { CursorAt } from '../../state/status';
import { LU3270Service } from '../../services/lu3270';
import { LayoutStateModel } from '../../state/layout';
import { LifecycleComponent } from 'ellib/lib/components/lifecycle';
import { OnChange } from 'ellib/lib/decorators/onchange';
import { PrefsStateModel } from '../../state/prefs';
import { ScreenStateModel } from '../../state/screen';
import { StatusStateModel } from '../../state/status';
import { Store } from '@ngxs/store';
import { debounce } from 'ellib/lib/utils';

/**
 * Screen component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-screen',
  styleUrls: ['screen.scss'],
  templateUrl: 'screen.html'
})

export class ScreenComponent extends LifecycleComponent
                             implements AfterViewInit {

  @Input() layout = {} as LayoutStateModel;
  @Input() prefs = {} as PrefsStateModel;
  @Input() screen = {} as ScreenStateModel;
  @Input() status = {} as StatusStateModel;

  @Output() fontSize = new EventEmitter<string>();

  private el: HTMLElement;
  private setup: Function;

  /** ctor */
  constructor(private element: ElementRef,
              private lu3270: LU3270Service,
              private store: Store) {
    super();
    // scale 3270 display for best fit
    this.setup = debounce(() => {
      // NOTE: these are magic numbers for the 3270 font based on a nominal
      // 18px size and a hack that forces the padding into the stylesheet
      this.el.style.padding = '8px 16px 16px 8px';
      const cx = (this.prefs.numCols * 9.65625) + 32;
      const cy = (this.prefs.numRows * 21) + 16;
      const scaleX = this.el.offsetWidth / cx;
      const scaleY = this.el.offsetHeight / cy;
      let fontSize;
      if (scaleX < scaleY)
        fontSize = `${18 * scaleX}px`;
      else fontSize = `${18 * scaleY}px`;
      this.el.style.fontSize = fontSize;
      this.fontSize.emit(fontSize);
    }, 250);
  }

  /** Position the cursor based on a mouse click */
  cursorAt(cellID: string) {
    if (cellID && cellID.startsWith('cell'))
      this.store.dispatch(new CursorAt(parseInt(cellID.substring(4), 10)));
  }

  /** Handle keystrokes */
  keystroke(event: KeyboardEvent) {
    console.log(event);
    if (event.code.startsWith('Arrow')) {
      const max = this.prefs.numCols * this.prefs.numRows;
      let cursorAt;
      switch (event.code) {
        case 'ArrowDown':
          cursorAt = this.status.cursorAt + this.prefs.numCols;
          if (cursorAt >= max)
            cursorAt = this.status.cursorAt % this.prefs.numCols;
        break;
        case 'ArrowLeft':
          cursorAt = this.status.cursorAt - 1;
          if (cursorAt < 0)
            cursorAt = max - 1;
          break;
        case 'ArrowRight':
          cursorAt = this.status.cursorAt + 1;
          if (cursorAt >= max)
            cursorAt = 0;
          break;
        case 'ArrowUp':
          cursorAt = this.status.cursorAt - this.prefs.numCols;
          if (cursorAt < 0)
            cursorAt = (this.status.cursorAt % this.prefs.numCols) + max - this.prefs.numCols;
          break;
      }
      this.store.dispatch(new CursorAt(cursorAt));
    }
    else if (event.code === 'Enter')
      this.lu3270.submit();
  }

  // listeners

  @HostListener('window:resize') onResize() {
    this.setup();
  }

  // bind OnChange handlers

  @OnChange('layout') updateLayout() {
    this.setup();
  }

  @OnChange('prefs') updatePrefs() {
    if (this.prefs) {
      const style = document.documentElement.style;
      switch (this.prefs.color) {
        case 'blue':
          style.setProperty('--lu3270-color', 'var(--mat-blue-300)');
          style.setProperty('--lu3270-highlight-color', 'var(--mat-blue-400)');
          break;
        case 'green':
          style.setProperty('--lu3270-color', 'var(--mat-green-300)');
          style.setProperty('--lu3270-highlight-color', 'var(--mat-green-400)');
          break;
        case 'orange':
          style.setProperty('--lu3270-color', 'var(--mat-orange-300)');
          style.setProperty('--lu3270-highlight-color', 'var(--mat-orange-400)');
          break;
        case 'white':
          style.setProperty('--lu3270-color', 'var(--mat-grey-100)');
          style.setProperty('--lu3270-highlight-color', 'white');
          break;
      }
      style.setProperty('--lu3270-cols', String(this.prefs.numCols));
      style.setProperty('--lu3270-rows', String(this.prefs.numRows));
      this.setup();
    }
  }

  // lifecycle methods

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.setup();
  }

}
