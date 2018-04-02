import { AID, Attributes, Cell, Command, LT, Order, WCC, addressFromBytes, addressToBytes } from './data-stream';
import { ApplicationRef, Injectable } from '@angular/core';
import { Connected, CursorAt, ErrorMessage, KeyboardLocked, Waiting } from '../state/status';
import { EraseUnprotectedScreen, ReplaceScreen, ResetMDT, UpdateScreen } from '../state/screen';
import { a2e, e2a } from 'ellib/lib/utils/convert';
import { dump, toHex } from 'ellib/lib/utils';

import { ElectronService } from 'ngx-electron';
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

  private address: number;
  private attributes: Attributes;
  private cursorAt: number;
  private offset: number;

  private fieldID = 0;

  private isConnected: boolean;

  private numCols: number;
  private numRows: number;

  /** ctor */
  constructor(private application: ApplicationRef,
              private electron: ElectronService,
              private store: Store) {
    this.electron.ipcRenderer.on('connected', this.connected.bind(this));
    this.electron.ipcRenderer.on('disconnected', this.disconnected.bind(this));
    this.electron.ipcRenderer.on('data', this.dataHandler.bind(this));
    this.electron.ipcRenderer.on('error', this.errorHandler.bind(this));
  }

  /** Connect to host */
  connect(host: string,
          port: number,
          model: string,
          numCols: number,
          numRows: number): void {
    if (!this.isConnected) {
      this.numCols = numCols;
      this.numRows = numRows;
      this.store.dispatch([new Connected(false),
      new Waiting(true)]);
      this.electron.ipcRenderer.send('connect', host, port, model);
    }
  }

  /** Reposition cursor, relative to its current position */
  cursorTo(cursorAt: number,
           cursorOp: 'down' | 'left' | 'right' | 'up'): number {
    const max = this.numCols * this.numRows;
    let cursorTo;
    switch (cursorOp) {
      case 'down':
        cursorTo = cursorAt + this.numCols;
        if (cursorTo >= max)
          cursorTo = cursorAt % this.numCols;
        break;
      case 'left':
        cursorTo = cursorAt - 1;
        if (cursorTo < 0)
          cursorTo = max - 1;
        break;
      case 'right':
        cursorTo = cursorAt + 1;
        if (cursorTo >= max)
          cursorTo = 0;
        break;
      case 'up':
        cursorTo = cursorAt - this.numCols;
        if (cursorTo < 0)
          cursorTo = (cursorAt % this.numCols) + max - this.numCols;
        break;
    }
    return cursorTo;
  }

  /** Disconnect from host */
  disconnect(): void {
    this.store.dispatch(new Waiting(true));
    this.electron.ipcRenderer.send('disconnect');
  }

  /** Submit screen to host */
  submit(aid: AID,
         cursorAt: number,
         cells: Cell[]): void {
    const data = this.submitHandler(aid, cursorAt, cells);
    this.store.dispatch(new Waiting(true));
    this.electron.ipcRenderer.send('write', data);
    this.application.tick();
  }

  // private methods

  private connected(): void {
    this.store.dispatch([new Connected(true),
    new Waiting(false),
    new ReplaceScreen({ cells: [] })]);
    this.isConnected = true;
  }

  private dataHandler(event: any,
                      data: Uint8Array): void {
    const actions: any[] = [];
    let slice: Uint8Array;
    dump(data, 'Host -> 3270', true, 'blue');
    // NOTE: data from host may be multiple frames delimited by LT
    for (let ix = 0, iy = 0; ix < data.length; ) {
      iy = data.indexOf(LT[0], ix);
      if ((iy !== -1) && (data[iy + 1] === LT[1])) {
        slice = data.slice(ix, iy);
        iy += 2;
      }
      else {
        slice = data.slice(ix);
        iy = data.length;
      }
      ix = iy;
      this.writeCommands(slice, actions);
    }
    // dispatch actions
    this.store.dispatch([new Waiting(false), ...actions]);
    this.application.tick();
  }

  private disconnected(): void {
    this.store.dispatch([new Connected(false),
    new Waiting(false),
    new ReplaceScreen({ cells: [] })]);
    this.isConnected = false;
  }

  private errorHandler(event: any,
                       error: string): void {
    this.store.dispatch([new Connected(false),
    new ErrorMessage(error)]);
    this.isConnected = false;
  }

  private initCells(fill: boolean): Cell[] {
    const cells = new Array(this.numCols * this.numRows);
    if (fill) {
      const filler = new Cell(null, new Attributes(true));
      cells.fill(filler);
    }
    return cells;
  }

  private readModified(cells: Cell[]): number[] {
    const modifiedByID: {[s: string]: { at: number, value: string }} = {};
    // group all the modified cells to form fields
    cells.forEach((cell, ix) => {
      if (cell.value && cell.attributes.modified) {
        let modified = modifiedByID[cell.id];
        if (!modified) {
          modified = {at: 0, value: ''};
          modifiedByID[cell.id] = modified;
        }
        if (!modified.at)
          modified.at = ix;
        modified.value += cell.value;
      }
    });
    // now convert them to SBA/SF sequences
    let data: number[] = [];
    Object.keys(modifiedByID).forEach(id => {
      const modified = modifiedByID[id];
      const bytes = [Order.SBA, ...addressToBytes(modified.at), Order.SF, ...a2e(modified.value)];
      data = data.concat(bytes);
    });
    return data;
  }

  private submitHandler(aid: AID,
                        cursorAt: number,
                        cells: Cell[]): Uint8Array {
    const data = new Uint8Array([aid, ...addressToBytes(cursorAt), ...this.readModified(cells), ...LT]);
    dump(data, '3270 -> Host', true, 'magenta');
    return data;
  }

  private writeCommands(data: Uint8Array,
                        actions: any[]): void {
    let retVal: { wcc?: WCC, cells?: Cell[] } = {};
    const command = data[0];
    switch (command) {
      case Command.EAU:
        retVal = this.writeOrdersAndData(data);
        actions.push(new EraseUnprotectedScreen({ cells: retVal.cells }));
        break;
      case Command.EW:
      case Command.EWA:
        retVal = this.writeOrdersAndData(data, true);
        actions.push(new ReplaceScreen({ cells: retVal.cells }));
        break;
      case Command.W:
        retVal = this.writeOrdersAndData(data);
        actions.push(new UpdateScreen({ cells: retVal.cells }));
        break;
      case Command.WSF:
        this.writeStructuredFields(data);
        // TODO: qcodes
        break;
      case Command.RB:
      case Command.RM:
      case Command.RMA:
        console.log(`%cCommand 0x${toHex(command, 2)} oh oh!`, 'color: red');
        break;
    }
    // process any cursor position
    if (this.cursorAt >= 0)
      actions.push(new CursorAt(this.cursorAt));
    // process the WCC
    if (retVal.wcc && retVal.wcc.resetMDT)
      actions.push(new ResetMDT());
    if (retVal.wcc && retVal.wcc.unlockKeyboard)
      actions.push(new KeyboardLocked(false));
  }

  private writeOrdersAndData(data: Uint8Array,
                             fill = false): { wcc: WCC, cells: Cell[] } {
    // these are the individual cells on the screen
    // we fill with dummy protrcted fields on erase
    const cells = this.initCells(fill);
    this.address = 0;
    this.attributes = new Attributes(true);
    this.cursorAt = -1;
    // NOTE: the command is at [0] and the WCC at [1]
    this.offset = 2;
    const wcc = WCC.fromByte(data[1]);
    while (this.offset < data.length) {
      const order = data[this.offset++];
      switch (order) {
        case Order.SF:
          this.attributes = Attributes.fromByte(data[this.offset++]);
          this.address += 1; // NOTE: attributes take up space!
          this.fieldID += 1;
          break;
        case Order.SFE:
          const count = data[this.offset++] * 2;
          const bytes = data.slice(this.offset, this.offset + count);
          this.attributes = Attributes.fromBytes(bytes);
          this.address += 1; // NOTE: attributes take up space!
          this.fieldID += 1;
          this.offset += count;
          break;
        case Order.SBA:
          this.address = addressFromBytes([data[this.offset++], data[this.offset++]]);
          break;
        case Order.SA:
          console.log('%cSA oh oh!', 'color: red');
          break;
        case Order.MF:
          console.log('%cMF oh oh!', 'color: red');
          break;
        case Order.IC:
          this.cursorAt = this.address;
          break;
        case Order.PT:
          console.log('%cPT oh oh!', 'color: red');
          break;
        case Order.RA:
          const repeatTo = addressFromBytes([data[this.offset++], data[this.offset++]]);
          const byte = data[this.offset++];
          const value = (byte === 0x00)? null : e2a([byte]);
          const max = this.numCols * this.numRows;
          while (true) {
            const id = `id${this.fieldID}`;
            cells[this.address++] = new Cell(value, this.attributes, id);
            if (this.address === repeatTo)
              break;
            if (this.address === max)
              this.address = 0;
          }
          break;
        case Order.EUA:
          console.log('%cEUA oh oh!', 'color: red');
          break;
        default:
          // if it isn't an order, then treat it as data
          if ((order === 0x00) || (order >= 0x40)) {
            const value = (order === 0x00)? null : e2a([order]);
            const id = `id${this.fieldID}`;
            cells[this.address++] = new Cell(value, this.attributes, id);
          }
          else console.log(`%cOrder 0x${toHex(order, 2)} oh oh!`, 'color: red');
      }
    }
    return { wcc, cells };
  }

  // NOTE: structured fields in ths context are graphics, symbols etc
  // we currently completely ignore them
  private writeStructuredFields(data: Uint8Array): void { }

}
