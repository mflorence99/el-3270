import { AID, Attributes, Cell, Command, Order, WCC, addressFromBytes } from './data-stream';
import { Connected, CursorAt, Waiting } from '../state/status';
import { EraseUnprotectedScreen, ReplaceScreen, UpdateScreen } from '../state/screen';
import { dump, e2a } from './convert';

import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

/**
 * Encapsulates 3270 device handling
 *
 * @see http://www.tommysprinkle.com/mvs/P3270/start.htm
 * @see http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/
 *        BOOKS/CN7P4000/CCONTENTS?DT=19920626112004
 * @see http://www.simotime.com/asc2ebc1.htm
 * @see https://www.ibm.com/support/knowledgecenter/en/
 *        SSGMCP_5.5.0/applications/designing/dfhp3b4.html
 * @see https://www.ibm.com/support/knowledgecenter/en/
 *        SSGMCP_5.5.0/applications/designing/dfhp3c7.html
 * @see http://www.prycroft6.com.au/misc/3270.html
 */

@Injectable()
export class LU3270Service {

  private connected: boolean;
  private numCols: number;
  private numRows: number;

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.electron.ipcRenderer.on('data', this.dataHandler.bind(this));
    this.electron.ipcRenderer.on('error', this.errorHandler.bind(this));
  }

  /** Connect to host */
  connect(host: string,
          port: number,
          model: string,
          numCols: number,
          numRows: number) {
    if (!this.connected) {
      this.numCols = numCols;
      this.numRows = numRows;
      this.store.dispatch(new Connected(false));
      this.store.dispatch(new Waiting(true));
      this.electron.ipcRenderer.send('connect', host, port, model);
    }
  }

  /** Disconnect from host */
  disconnect() {
    this.store.dispatch(new Connected(false));
    this.store.dispatch(new ReplaceScreen({ cells: [] }));
    this.electron.ipcRenderer.send('disconnect');
    this.connected = false;
  }

  /** Submit via ENTER */
  submit() {
    this.store.dispatch(new Waiting(true));
    this.electron.ipcRenderer.send('submit', new Uint8Array([AID.ENTER, 0xFF, 0xEF]));
  }

  // private methods

  private dataHandler(event: any,
                      data: Uint8Array) {
    // if we weren't connected, we are now
    this.store.dispatch(new Waiting(false));
    if (!this.connected) {
      this.store.dispatch(new Connected(true));
      this.connected = true;
    }
    // debugging
    dump(data, 'Host -> 3270', true);
    // breakdown data stream
    let retVal: {wcc: WCC, cells: Cell[]};
    switch (data[0]) {
      case Command.EAU:
        retVal = this.processOrdersAndData(data);
        this.store.dispatch(new EraseUnprotectedScreen({ cells: retVal.cells }));
        console.log(retVal.wcc.toString());
        break;
      case Command.EW:
      case Command.EWA:
        retVal = this.processOrdersAndData(data, true);
        this.store.dispatch(new ReplaceScreen({ cells: retVal.cells }));
        console.log(retVal.wcc.toString());
        break;
      case Command.W:
        retVal = this.processOrdersAndData(data);
        this.store.dispatch(new UpdateScreen({ cells: retVal.cells }));
        console.log(retVal.wcc.toString());
        break;
      case Command.WSF:
        this.processStructuredFields(data);
        break;
      case Command.RB:
      case Command.RM:
      case Command.RMA:
        console.log(`%cCommand 0x${data[0].toString(16)} oh oh!`, 'color: red');
        break;
    }
    // TODO: do somehing with the WCC
  }

  private errorHandler(event: any,
                       error: string) {
    this.store.dispatch(new Connected(false));
  }

  private processOrdersAndData(data: Uint8Array,
                               fill = false): {wcc: WCC, cells: Cell[]} {
    let offset = 2;
    let address = 0;
    // NOTE: the command is at [0] and the WCC at [1]
    const wcc = WCC.fromByte(data[1]);
    // these are the individual cells on the screen
    // we fill with dummy protrcted fields on erase
    const cells = new Array(this.numCols * this.numRows);
    if (fill) {
      const filler = new Cell(null, new Attributes(true));
      cells.fill(filler);
    }
    // now build cells from the stream
    // NOTE: [0xFF, 0xFE] marks end of stream
    while ((offset < data.length) && (data[offset] !== 0xFF)) {
      const order = data[offset++];
      switch (order) {
        case Order.SF:
          const attributes = Attributes.fromByte(data[offset++]);
          address += 1; // NOTE: attributes take up space!
          while (data[offset] && (data[offset] >= 0x40)) {
            const value = e2a(new Uint8Array([data[offset++]]));
            cells[address++] = new Cell(value, attributes);
          }
          break;
        case Order.SFE:
          console.log('%cSFE oh oh!', 'color: red');
          break;
        case Order.SBA:
          address = addressFromBytes(new Uint8Array([data[offset++], data[offset++]]));
          break;
        case Order.SA:
          console.log('%cSA oh oh!', 'color: red');
          break;
        case Order.MF:
          console.log('%cMF oh oh!', 'color: red');
          break;
        case Order.IC:
          this.store.dispatch(new CursorAt(address));
          break;
        case Order.PT:
          console.log('%cPT oh oh!', 'color: red');
          break;
        case Order.RA:
          console.log('%cRA oh oh!', 'color: red');
          break;
        case Order.EUA:
          console.log('%cEUA oh oh!', 'color: red');
          break;
        default:
          // if it isn't an order, then treat it as data
          if (order >= 0x40) {
            const value = e2a(new Uint8Array([order]));
            cells[address++] = new Cell(value);
          }
          else console.log(`%cOrder 0x${order.toString(16)} oh oh!`, 'color: red');
      }
    }
    return {wcc, cells};
  }

  // NOTE: structured fields in ths context are graphics, synbols etc
  // we currently completely ignore them
  private processStructuredFields(data: Uint8Array): void {  }

}
