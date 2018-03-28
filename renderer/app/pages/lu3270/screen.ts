import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';

import { debounce } from 'ellib/lib/utils';

/**
 * Screen component
 */

@Component({
  selector: 'el3270-screen',
  styleUrls: ['screen.scss'],
  templateUrl: 'screen.html'
})

export class ScreenComponent implements AfterViewInit {

  numCols = 80;
  numRows = 43;

  cells = new Array(this.numCols * this.numRows);

  private el: HTMLElement;
  private setup: Function;

  /** ctor */
  constructor(private element: ElementRef) {
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

  // lifecycle methods

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.setup();
  }

}
