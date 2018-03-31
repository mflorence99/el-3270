import { Attributes, Cell, Command, Order, WCC, addressFromBytes } from './data-stream';
import { Connected, CursorAt, Waiting } from '../state/status';
import { dump, e2a } from './convert';

import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateScreen } from '../state/screen';

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

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.electron.ipcRenderer.on('data', this.dataHandler.bind(this));
    this.electron.ipcRenderer.on('error', this.errorHandler.bind(this));
  }

  /** Connect to host */
  connect(host: string,
          port: number,
          model: string) {
    if (!this.connected) {
      this.store.dispatch(new Connected(false));
      this.store.dispatch(new Waiting(true));
      this.electron.ipcRenderer.send('connect', host, port, model);
      this.connected = true;
    }
  }

  /** Disconnect from host */
  disconnect() {
    this.store.dispatch(new Connected(false));
    this.store.dispatch(new UpdateScreen({ cells: [] }));
    this.electron.ipcRenderer.send('disconnect');
    this.connected = false;
  }

  // private methods

  private dataHandler(event: any,
                      data: Uint8Array) {
    this.store.dispatch(new Connected(true));
    this.store.dispatch(new Waiting(false));
    dump(data, 'Host -> 3270', true);
    switch (data[0]) {
      case Command.EAU:
      case Command.EW:
      case Command.EWA:
      case Command.W:
      case Command.WSF:
        this.processOutbound(data);
        break;
      case Command.RB:
      case Command.RM:
      case Command.RMA:
        console.log(`%cCommand 0x${data[0].toString(16)} oh oh!`, 'color: red');
        break;
    }
  }

  private errorHandler(event: any,
                       error: string) {
    this.store.dispatch(new Connected(false));
  }

  private processOutbound(data: Uint8Array): void {
    const command = data[0];
    let wcc;
    switch (command) {
      case Command.WSF:
        wcc = new WCC();
        this.processStructuredFields(data.slice(1));
        break;
      default:
        wcc = WCC.fromByte(data[1]);
        this.processOrdersAndData(data.slice(2));
        break;
    }
  }

  private processOrdersAndData(data: Uint8Array): void {
    let offset = 0;
    const cells = [];
    let address = 0;
    while (offset < data.length) {
      const order = data[offset++];
      switch (order) {
        case Order.SF:
          const attributes = Attributes.fromByte(data[offset++]);
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
          console.log(`%cOrder 0x${order.toString(16)} oh oh!`, 'color: red');
      }
    }
    this.store.dispatch(new UpdateScreen({ cells }));
  }

  private processStructuredFields(data: Uint8Array): void {
  }

}
