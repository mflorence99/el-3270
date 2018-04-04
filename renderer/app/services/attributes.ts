import { Color, Highlight, TypeCode } from './types';

import { Cell } from './cell';

/**
 * Model 3270 field attributes
 */

export class Attributes {

  /** Create from a single byte, as in SF */
  static fromByte(byte: number): Attributes {
    return new Attributes(((byte & 0b00100000) !== 0),
                          ((byte & 0b00010000) !== 0),
                          ((byte & 0b00001000) !== 0) && ((byte & 0b00000100) === 0),
                          ((byte & 0b00001000) !== 0) && ((byte & 0b00000100) !== 0),
                          ((byte & 0b00000001) !== 0));
  }

  /** Create from multiple bytes, as in SFE */
  static fromBytes(bytes: number[]): Attributes {
    let basic = 0;
    let blink = false;
    let reverse = false;
    let underscore = false;
    let color = Color.NEUTRAL;
    for (let i = 0; i < bytes.length; i++) {
      switch (bytes[i]) {
        case TypeCode.BASIC:
          basic = bytes[i + 1];
          break;
        case TypeCode.HIGHLIGHT:
          switch (bytes[i + 1]) {
            case Highlight.BLINK:
              blink = true;
              break;
            case Highlight.REVERSE:
              reverse = true;
              break;
            case Highlight.UNDERSCORE:
              underscore = true;
              break;
          }
          break;
        case TypeCode.COLOR:
          color = bytes[i + 1];
          break;
      }
    }
    return new Attributes(((basic & 0b00100000) !== 0),
                          ((basic & 0b00010000) !== 0),
                          ((basic & 0b00001000) !== 0) && ((basic & 0b00000100) === 0),
                          ((basic & 0b00001000) !== 0) && ((basic & 0b00000100) !== 0),
                          ((basic & 0b00000001) !== 0),
                          blink,
                          reverse,
                          underscore,
                          color);
  }

  /** Create from others */
  static from(...another: any[]): Attributes {
    const attributes = new Attributes();
    Object.assign(attributes, ...another);
    return attributes;
  }

  /** ctor */
  constructor(public protect = false,
              public numeric = false,
              public highlight = false,
              public hidden = false,
              public modified = false,
              public blink = false,
              public reverse = false,
              public underscore = false,
              public color = Color.NEUTRAL) { }

  /** Convert to CSS */
  modify(typeCode: number,
         another: any): void {
    switch (typeCode) {
      case TypeCode.BASIC:
        this.protect = another.protect;
        this.numeric = another.numeric;
        this.highlight = another.highlight;
        this.hidden = another.hidden;
        this.modified = another.modified;
        break;
      case TypeCode.HIGHLIGHT:
        this.blink = another.blink;
        this.reverse = another.reverse;
        this.underscore = another.underscore;
        break;
      case TypeCode.COLOR:
        this.color = another.color;
        break;
    }
  }

  /** Convert to CSS */
  toCSS(cell: Cell,
        cursorAt: boolean,
        focused: boolean): {} {
    const style: any = { };
    if (cursorAt) {
      if (this.hidden) {
        style.backgroundColor = 'var(--lu3270-color)';
        style.color = 'var(--lu3270-color)';
      }
      else if (focused) {
        style.backgroundColor = 'var(--lu3270-color)';
        style.color = 'var(--background-color)';
      }
      style.outline = '1px solid var(--lu3270-color)';
    }
    else if (this.hidden) {
      style.backgroundColor = 'var(--background-color)';
      style.color = 'var(--background-color)';
    }
    else if (!cell.attribute) {
      if (this.highlight)
        style.fontWeight = '900';
      if (this.blink)
        style.animation = 'blink 1s linear infinite';
      if (this.underscore)
        style.textDecoration = 'underline';
      switch (this.color) {
        case Color.BLUE:
          style.color = style.highlight? 'var(--mat-blue-400)' : 'var(--mat-blue-300)';
          break;
        case Color.RED:
          // NOTE: subjective compensation for relative low-intensity
          style.color = style.highlight? 'var(--mat-red-500)' : 'var(--mat-red-400)';
          break;
        case Color.PINK:
          style.color = style.highlight? 'var(--mat-pink-400)' : 'var(--mat-pink-300)';
          break;
        case Color.GREEN:
          style.color = style.highlight? 'var(--mat-green-400)' : 'var(--mat-green-300)';
          break;
        case Color.TURQUOISE:
          style.color = style.highlight? 'var(--mat-cyan-400)' : 'var(--mat-cyan-300)';
          break;
        case Color.YELLOW:
          style.color = style.highlight? 'var(--mat-yellow-400)' : 'var(--mat-yellow-300)';
          break;
        case Color.WHITE:
          style.color = style.highlight? 'white' : 'var(--mat-grey-100)';
          break;
        default:
          if (style.highlight)
            style.color = 'var(--lu3270-highlight-color)';
      }
      if (cell.value && this.reverse) {
        style.backgroundColor = style.color? style.color : 'var(--lu3270-color)';
        style.color = 'var(--mat-grey-900)';
      }
    }
    return style;
  }

  /** String dump, for testing */
  toString() {
    return `ATTR=[${this.protect? 'PROT ' : ''}${this.numeric? 'NUM ' : ''}${this.highlight? 'HILITE ' : ''}${this.hidden? 'HIDDEN ' : ''}${this.modified? 'MDT ' : ''}${this.blink? 'BLINK ' : ''}${this.reverse? 'REV ' : ''}${this.underscore? 'USCORE ' : ''}${Color[this.color]}]`;
  }

}
