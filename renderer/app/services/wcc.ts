
/**
 * Model the WCC
 */

export class WCC {

  /** Create from a single byte, as in EW, EWA and EAU */
  static fromByte(byte: number): WCC {
    return new WCC(((byte & 0b00000100) !== 0),
                   ((byte & 0b01000000) !== 0),
                   ((byte & 0b00000001) !== 0),
                   ((byte & 0b00000010) !== 0));
  }

  /** Create from an object hash, for testing mainly */
  static from(another: any): WCC {
    const wcc = new WCC();
    Object.assign(wcc, another);
    return wcc;
  }

  /** ctor */
  constructor(public alarm = false,
              public reset = false,
              public resetMDT = false,
              public unlockKeyboard = false) { }

  /** Convert back to byte representation */
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

  /** Convert to string for testing */
  toString(): string {
    return `WCC=[${this.alarm? 'ALARM ' : ''}${this.reset? 'RESET ' : ''}${this.resetMDT? '-MDT ' : ''}${this.unlockKeyboard? 'UNLOCK' : ''}]`;
  }

}
