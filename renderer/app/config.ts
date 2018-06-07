/**
 * Common configuration settings
 */

export class Config {

  fontSizeThrottle = 250;
  setBoundsThrottle = 250;

  portMax = 65535;
  portMin = 23;

  // all these magic numbers have to coordinate to
  // properly scale the 3270 font

  magic = {
    cxFactor: 9.65625,
    cyFactor: 21,
    nominalFontSize: 18,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8
  };

}

export const config = new Config();
