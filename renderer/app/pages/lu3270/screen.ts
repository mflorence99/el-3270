import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input } from '@angular/core';

import { LayoutStateModel } from '../../state/layout';
import { LifecycleComponent } from 'ellib/lib/components/lifecycle';
import { OnChange } from 'ellib/lib/decorators/onchange';
import { PrefsStateModel } from '../../state/prefs';
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

  cells = [];

  private el: HTMLElement;
  private setup: Function;

  /** ctor */
  constructor(private element: ElementRef) {
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
      if (scaleX < scaleY)
        this.el.style.fontSize = `${18 * scaleX}px`;
      else this.el.style.fontSize = `${18 * scaleY}px`;
    }, 250);
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
      // NOTE: temporary
      this.cells = new Array(this.prefs.numCols * this.prefs.numRows);
      this.setup();
    }
  }

  // lifecycle methods

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.setup();
  }

}
