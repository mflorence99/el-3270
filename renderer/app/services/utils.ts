/**
 * This table converts from 6-bits to EBCDIC
 *
 * @see http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
 *        CN7P4000/C.0?DT=19920626112004#FIGBINVALS
 */
export const six2e = [
  0x40, 0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7,
  0xC8, 0xC9, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F,
  0x50, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7,
  0xD8, 0xD9, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F,
  0x60, 0x61, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7,
  0xE8, 0xE9, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F,
  0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7,
  0xF8, 0xF9, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F
];

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
  bytes[0] = six2e[(address >> 6) & 0b00111111];
  bytes[1] = six2e[address &= 0b00111111];
  return bytes;
}

/**
 * Extract bytes from a dump, as in tcpdump for example
 *
 * eg: 01 000a 02e5 0002 006f 090c 0d70
 */
export function bytesFromDump(dump: string): number[] {
  const bytes: number[] = [];
  const str = dump.replace(/ /g, '');
  for (let ix = 0; ix < str.length; ix += 2)
    bytes[bytes.length] = parseInt(str.substring(ix, ix + 2), 16);
  return bytes;
}
