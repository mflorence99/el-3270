import { Attributes } from './attributes';

/**
 * Model a cell on the 3270 screen
 *
 * NOTE: there's one of these for each buffer position
 */

export class Cell {

  /** ctor */
  constructor(public value: string = null,
              public attributes: Attributes = new Attributes()) { }

}
