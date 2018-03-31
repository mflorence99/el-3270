/**
 * Conversion between EBCDIC and ASCII
 *
 * @see https://stackoverflow.com/questions/25367120/
          example-ebcdic-file-for-java-program-to-convert-ebcdic-to-ascii
 */

/** NOTE: starts at position 64 */
const ebcdic: any[] = [
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  // start on line 64 to make reconciliation easier
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '¢',
  '.',
  '<',
  '(',
  '+',
  '|',
  '&',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '!',
  '$',
  '*',
  ')',
  ';',
  '¬',
  '-',
  '/',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '|',
  ',',
  '%',
  '_',
  '>',
  '?',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '`',
  ':',
  '#',
  '@',
  '\'',
  '=',
  '\"',
  '\u00a0',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '`',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '{',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '}',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\\',
  '\u00a0',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0',
  '\u00a0'
];

// reverse engineer ascii
const ascii = new Array(256);

for (let i = 0; i < ebcdic.length; i++) {
  if (ebcdic[i] !== null)
    ascii[ebcdic[i].charCodeAt(0)] = i + 64;
}

/**
 * Convert from ASCII to EBCDIC
 */

export function a2e(a: string): Uint8Array {
  const e = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++)
    e[i] = ascii[a.charCodeAt(i)];
  return e;
}

/**
 * Convert from EBCDIC to ASCII
 */

export function e2a(e: Uint8Array): string {
  let a = '';
  for (let i = 0; i < e.length; i++) {
    if (e[i] >= 64)
      a += ebcdic[e[i] - 64];
    else a += '.';
  }
  return a;
}

/**
 * Dump buffer
 */

export function dump(data: Uint8Array,
                     title: string,
                     ebcdic = false): void {
  const sliceSize = 32;
  // formatter
  const toHex = ((num: number, pad: number) => {
    const padding = '00000000'.substring(0, pad);
    const hex = num.toString(16);
    return padding.substring(0, padding.length - hex.length) + hex;
  });
  // dumper
  const dumpSlice = ((bytes: Uint8Array): {hex, str} => {
    let hex = '';
    let str = '';
    let ix = 0;
    // decode to hex and string equiv
    for (; ix < bytes.length; ix++) {
      const byte = bytes[ix];
      hex += `${toHex(byte, 2)}`;
      const char = ebcdic? e2a(new Uint8Array([byte])) : String.fromCharCode(byte);
      // NOTE: use special character in string as a visual aid to counting
      str += (char === ' ')? '\u8226' : char;
      if ((ix > 0) && ((ix % 4) === 3))
        hex += ' ';
    }
    // pad remainder of slice
    for (; ix < sliceSize; ix++) {
      hex += '  ';
      str += ' ';
      if ((ix > 0) && ((ix % 4) === 3))
        hex += ' ';
  }
    // separate quads
    return {hex, str};
  });
  // now iterate over buffer dumping lines
  let offset = 0;
  const total = data.length;
  console.groupCollapsed(`${title} ${ebcdic? '(EBCDIC-encoded)' : ''}`);
  console.log('%c      00       04       08       0c       10       14       18       1c        00  04  08  0c  10  14  18  1c  ', 'font-weight: bold');
  while (true) {
    const slice = new Uint8Array(data.slice(offset, Math.min(offset + sliceSize, total)));
    const {hex, str} = dumpSlice(slice);
    console.log(`%c${toHex(offset, 4)}: %c${hex} %c${str}`, 'font-weight: bold', 'color: black', 'color: grey');
    // setup for next time
    if (slice.length < sliceSize)
      break;
    offset += sliceSize;
  }
  console.groupEnd();
}
