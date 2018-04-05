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

export enum Color {
  NEUTRAL   = 0x00,
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
  W   = 0xF1,
  WSF = 0xF3
}

export enum Highlight {
  BLINK      = 0xF1,
  REVERSE    = 0xF2,
  UNDERSCORE = 0xF4
}

export enum Op {
  Q       = 0x02,
  QL      = 0x03,
  RB      = 0xF2,
  RM      = 0xF6,
  RMA     = 0x6E,
  UNKNOWN = 0xFF
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

export enum QCode {
  ALPHANUMERIC_PARTITIONS = 0x84,
  CHARACTER_SETS = 0x85,
  COLOR = 0x86,
  DDM = 0x95,
  HIGHLIGHTING = 0x87,
  IMPLICIT_PARTITION = 0xA6,
  REPLY_MODES = 0x88,
  RPQ_NAMES = 0xA1,
  SUMMARY = 0x80,
  USABLE_AREA = 0x81
}

export enum TypeCode {
  BASIC     = 0xC0,
  HIGHLIGHT = 0x41,
  COLOR     = 0x42
}

export enum SFID {
  QUERY_REPLY    = 0x81,
  READ_PARTITION = 0x01
}
