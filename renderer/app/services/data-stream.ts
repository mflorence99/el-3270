/**
 * Model 3270 data stream
 *
 * @see http://users.cs.cf.ac.uk/Dave.Marshall/Internet/node141.html
 * @see http://www.prycroft6.com.au/misc/3270.html
 * @see https://www.ibm.com/support/knowledgecenter/en/
 *        SSGMCP_5.5.0/applications/designing/dfhp3b4.html
 * @see https://www.ibm.com/support/knowledgecenter/en/
 *        SSGMCP_5.5.0/applications/designing/dfhp3c7.html
 */

/**
 * Model 3270 field attributes
 */
export class Attributes {

  static fromByte(byte: number): Attributes {
    return new Attributes(((byte & 0b00100000) !== 0),
                          ((byte & 0b00010000) !== 0),
                          ((byte & 0b00001000) !== 0) && ((byte & 0b00000100) === 0),
                          ((byte & 0b00001000) !== 0) && ((byte & 0b00000100) !== 0),
                          ((byte & 0b00000001) !== 0));
  }

  static fromBytes(bytes: Uint8Array): Attributes {
    let basic = 0;
    let blink = false;
    let reverse = false;
    let underscore = false;
    let color = Color.DEFAULT;
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

  static fromObj(obj: any): Attributes {
    const attributes = new Attributes();
    Object.assign(attributes, obj);
    return attributes;
  }

  constructor(public protect = false,
              public numeric = false,
              public highlight = false,
              public hidden = false,
              public modified = false,
              public blink = false,
              public reverse = false,
              public underscore = false,
              public color = Color.DEFAULT) { }

  toCSS(cursor: boolean) {
    const style: any = { };
    if (cursor)
      style.outline = '1px solid var(--lu3270-color)';
    if (this.highlight)
      style.fontWeight = '900';
    if (this.hidden)
      style.visibility = 'hidden';
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
    if (this.reverse) {
      style.backgroundColor = style.color? style.color : 'var(--lu3270-color)';
      style.color = (this.color === Color.WHITE)? 'var(--mat-grey-900)' : 'white';
    }
    return style;
  }

  toString() {
    return `ATTR=[${this.protect? 'PROT ' : ''}${this.numeric? 'NUM ' : ''}${this.highlight? 'HILITE ' : ''}${this.hidden? 'HIDDEN ' : ''}${this.modified? 'MDT ' : ''}${this.blink? 'BLINK ' : ''}${this.reverse? 'REV ' : ''}${this.underscore? 'USCORE ' : ''}COLOR.${this.color}]`;
  }

}

/**
 * Model a cell on the 3270 screen
 *
 * NOTE: there's one of these for each buffer position
 */
export class Cell {
  constructor(public value: string = null,
              public attributes: Attributes = new Attributes(),
              public id: string = null) { }
}

/**
 * Model the WCC
 */
export class WCC {

  static fromByte(byte: number): WCC {
    return new WCC(((byte & 0b00000100) !== 0),
                   ((byte & 0b01000000) !== 0),
                   ((byte & 0b00000001) !== 0),
                   ((byte & 0b00000010) !== 0));
  }

  static fromObj(obj: any): WCC {
    const wcc = new WCC();
    Object.assign(wcc, obj);
    return wcc;
  }

  constructor(public alarm = false,
              public reset = false,
              public resetMDT = false,
              public unlockKeyboard = false) { }

  toByte(): number {
    let byte = 0b00000000;
    if (this.alarm)
      byte &= 0b00000100;
    if (this.reset)
      byte &= 0b01000000;
    if (this.resetMDT)
      byte &= 0b00000001;
    if (this.unlockKeyboard)
      byte &= 0b00000010;
    return byte;
  }

  toString(): string {
    return `WCC=[${this.alarm? 'ALARM ' : ''}${this.reset? 'RESET ' : ''}${this.resetMDT? '-MDT ' : ''}${this.unlockKeyboard? 'UNLOCK' : ''}]`;
  }

}

/**
 * Calculate a buffer address from 3270 12-bit encoding
 */
export function addressFromBytes(bytes: number[]): number {
  let address = bytes[0];
  address &= 0b00111111;
  address = address << 6;
  address += bytes[1] & 0b00111111;
  return address;
}

/**
 * Calculate 3270 12-bit encoding from buffer address
 */
export function addressToBytes(address: number): number[] {
  const bytes: number[] = [];
  const tr = [
    0x40, 0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7,
    0xC8, 0xC9, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F,
    0x50, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7,
    0xD8, 0xD9, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F,
    0x60, 0x61, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7,
    0xE8, 0xE9, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F,
    0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7,
    0xF8, 0xF9, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F
  ];
  bytes[0] = tr[(address >> 6) & 0b00111111];
  bytes[1] = tr[address &= 0b00111111];
  return bytes;
}

/**
 * Common constants
 */

export const LT = [0xFF, 0xEF];

/**
 * Common types
 */

export enum AID {
  DEFAULT = 0x88,
  CLEAR   = 0x6D,
  ENTER   = 0x7D,
  PA1     = 0x6C,
  PA2     = 0x6E,
  PA3     = 0x6B,
  PF1     = 0xF1,
  PF2     = 0xF2,
  PF3     = 0xF3,
  PF4     = 0xF4,
  PF5     = 0xF5,
  PF6     = 0xF6,
  PF7     = 0xF7,
  PF8     = 0xF8,
  PF9     = 0xF9,
  PF10    = 0x7A,
  PF11    = 0x7B,
  PF12    = 0x7C,
  PF13    = 0xC1,
  PF14    = 0xC2,
  PF15    = 0xC3,
  PF16    = 0xC4,
  PF17    = 0xC5,
  PF18    = 0xC6,
  PF19    = 0xC7,
  PF20    = 0xC8,
  PF21    = 0xC9,
  PF22    = 0x4A,
  PF23    = 0x4B,
  PF24    = 0x4C
}

// NOTE: preserveConstEnums in tsconfig makes this work
// see https://stackoverflow.com/questions/18111657/
//       how-does-one-get-the-names-of-typescript-enum-entries
export const AIDLookup = {};
for (const aid in AID)
  AIDLookup[aid] = AID[aid];

export enum Color {
  DEFAULT   = 0x00,
  BLUE      = 0xF1,
  RED       = 0xF2,
  PINK      = 0xF3,
  GREEN     = 0xF4,
  TURQUOISE = 0xF5,
  YELLOW    = 0xF6,
  WHITE     = 0xF7
}

export enum Command {
  EAU = 0x6F,
  EW  = 0xF5,
  EWA = 0x7E,
  RB  = 0xF2,
  RM  = 0xF6,
  RMA = 0x6E,
  W   = 0xF1,
  WSF = 0xF3
}

export enum Highlight {
  BLINK      = 0xF1,
  REVERSE    = 0xF2,
  UNDERSCORE = 0xF4
}

export enum Order {
  SF  = 0x1D,
  SFE = 0x29,
  SBA = 0x11,
  SA  = 0x28,
  MF  = 0x2C,
  IC  = 0x13,
  PT  = 0x05,
  RA  = 0x3C,
  EUA = 0x12,
  GE  = 0x08
}

export enum TypeCode {
  BASIC     = 0xC0,
  HIGHLIGHT = 0x41,
  COLOR     = 0x42
}
