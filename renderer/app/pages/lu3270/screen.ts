import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { CursorAt } from '../../state/status';
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
  cursorAt(cursorAt: number) {
    this.store.dispatch(new CursorAt(cursorAt));
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
