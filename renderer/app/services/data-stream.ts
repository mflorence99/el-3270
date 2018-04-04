/**
 * Model a stream over the array of bytes we get from the device
 */

export class InputDataStream {

  private offset = 0;

  /** ctor */
  constructor(public data: Uint8Array) { }

  /** Are there enough bytes in stream for this count? */
  hasEnough(count: number): boolean {
    return (this.offset + count) < this.data.length;
  }

  /** Any more bytes in stream? */
  hasNext(): boolean {
    return this.offset <= this.data.length;
  }

  /** Consume the next byte */
  next(): number {
    return this.data[this.offset++];
  }

  /** Consunme the next halfword */
  next16() {
    const hi = this.next();
    const lo = this.next();
    return (hi * 256) + lo;
  }

  /** Consume the next N btees */
  nextBytes(count: number): number[] {
    const slice = this.peekBytes(count);
    if (slice !== null)
      this.offset += count;
    return slice;
  }

  /** Take a peek at the next byte */
  peek(): number {
    return this.data[this.offset];
  }

  /** Take a peek at the next N bytes */
  peekBytes(count: number): number[] {
    if ((this.offset + count) > this.data.length)
      return null;
    else {
      const slice: number[] = new Array(count);
      for (let ix = 0; ix < count; ix++)
        slice[ix] = this.data[this.offset + ix];
      return slice;
    }
  }

}
/**
 * Model a stream over the array of bytes we send to the device
 */

export class OutputDataStream {

  public data: number[] = [];

  private offset = 0;

  /** Emit a byte */
  put(byte: number): void {
    this.data[this.offset++] = byte;
  }

  /** Emit a halfword */
  put16(count: number): void {
    this.data[this.offset++] = count >> 8;
    this.data[this.offset++] = count & 0x00FF;
  }

  /** Emit an array of bytes */
  putBytes(bytes: number[]): void {
    this.data = this.data.concat(bytes);
    this.offset += bytes.length;
  }

  /** Publish as array */
  toArray(): Uint8Array {
    return new Uint8Array(this.data);
  }

}
