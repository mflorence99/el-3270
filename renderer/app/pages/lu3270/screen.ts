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

  numCols = 0;
  numRows = 0;

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
      const cx = (this.numCols * 9.65625) + 32;
      const cy = (this.numRows * 21) + 16;
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
      // this is the color
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
      // this is the model
      switch (this.prefs.model) {
        case 'IBM-3278-1-E':
          this.numCols = 80;
          this.numRows = 12;
          break;
        case 'IBM-3278-2-E':
          this.numCols = 80;
          this.numRows = 24;
          break;
        case 'IBM-3278-3-E':
          this.numCols = 80;
          this.numRows = 32;
          break;
        case 'IBM-3278-4-E':
          this.numCols = 80;
          this.numRows = 43;
          break;
        case 'IBM-3278-5-E':
          this.numCols = 132;
          this.numRows = 27;
          break;
      }
      style.setProperty('--lu3270-cols', String(this.numCols));
      style.setProperty('--lu3270-rows', String(this.numRows));
      // NOTE: temporary
      this.cells = new Array(this.numCols * this.numRows);
      this.setup();
    }
  }

  // lifecycle methods

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.setup();
  }

}
