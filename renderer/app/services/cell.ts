import { Attributes } from './attributes';

/**
 * Model a cell on the 3270 screen
 *
 * NOTE: there's one of these for each buffer position
 */

export class Cell {

  /** ctor */
  constructor(public value: string = null,
              public attributes: Attributes = new Attributes(),
              public attribute = false) { }

  /** Convert to CSS */
  toCSS(cursorAt: boolean,
        focused: boolean): { } {
    // delegate to attributes
    return this.attributes.toCSS(this, cursorAt, focused);
  }

}
