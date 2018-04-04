import { AID, Command, Order, QCode, SFID } from './types';
import { ApplicationRef, Injectable } from '@angular/core';
import { CommandLookup, LT, OrderLookup } from './constants';
import { Connected, CursorAt, ErrorMessage, KeyboardLocked, Waiting } from '../state/status';
import { EraseUnprotectedScreen, ReplaceScreen, ResetMDT, UpdateScreen } from '../state/screen';
import { InputDataStream, OutputDataStream } from './data-stream';
import { a2e, e2a } from 'ellib/lib/utils/convert';
import { addressFromBytes, addressToBytes, bytesFromDump } from './utils';
import { dump, toHex } from 'ellib/lib/utils';

import { Attributes } from './attributes';
import { Cell } from './cell';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngxs/store';
import { WCC } from './wcc';

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
      this.writeCommands(new InputDataStream(slice), actions);
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
    const max = this.numCols * this.numRows;
    const cells = new Array(max);
    if (fill) {
      for (let ix = 0; ix < max; ix++)
        cells[ix] = new Cell(null, new Attributes());
    }
    return cells;
  }

  private sendQCodes(): void {
    // NOTE: we don't really read them, we just make them up
    // to represent the device we're simulating
    const ostream = new OutputDataStream();
    ostream.put(AID.DEFAULT);
    // first comes the summary of the QCodes we support
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.1?SHELF=&DT=19920626112004&CASE=
    const summary = [
      SFID.QUERY_REPLY,
      QCode.SUMMARY, // here is a summary
      QCode.SUMMARY, // and we support the summary qcode
      QCode.USABLE_AREA,
      QCode.ALPHANUMERIC_PARTITIONS,
      QCode.CHARACTER_SETS,
      QCode.COLOR,
      QCode.HIGHLIGHTING,
      QCode.REPLY_MODES,
      QCode.DDM,
      QCode.RPQ_NAMES,
      QCode.IMPLICIT_PARTITION
    ];
    ostream.put16(summary.length + 2);
    ostream.putBytes(summary);
    // next the useable area
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.51.2.1?SHELF=&DT=19920626112004&CASE=
    const useableArea = [
      SFID.QUERY_REPLY,
      QCode.USABLE_AREA,
      0x01, // flags
      0x00, // flags
      0x00,
      this.numCols,
      0x00,
      this.numRows,
      // the rest from x3270 tcpdump
      ...bytesFromDump('01 000a 02e5 0002 006f 090c 0d70')
    ];
    ostream.put16(useableArea.length + 2);
    ostream.putBytes(useableArea);
    // next alpha numeric partitions
    const alphaPartitions = [
      SFID.QUERY_REPLY,
      QCode.ALPHANUMERIC_PARTITIONS,
      // the rest from x3270 tcpdump
      ...bytesFromDump('000d 7000')
    ];
    ostream.put16(alphaPartitions.length + 2);
    ostream.putBytes(alphaPartitions);
    // next character sets
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.12.4.2?SHELF=&DT=19920626112004
    const characterSets = [
      SFID.QUERY_REPLY,
      QCode.CHARACTER_SETS,
      // the rest from x3270 tcpdump
      ...bytesFromDump('8200 090c 0000 0000 0700 1000 02b9 0025 0110 f103 c301 36')
    ];
    ostream.put16(characterSets.length + 2);
    ostream.putBytes(characterSets);
    // next color
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.13.2?SHELF=&DT=19920626112004&CASE=
    const color = [
      SFID.QUERY_REPLY,
      QCode.COLOR,
      // the rest from x3270 tcpdump
      ...bytesFromDump('00 1000 f4f1 f1f2 f2f3 f3f4 f4f5 f5f6 f6f7 f7f8 f8f9 f9fa fafb fbfc fcfd fdfe feff ffff ff')
    ];
    ostream.put16(color.length + 2);
    ostream.putBytes(color);
    // next highlighting
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.28.2?SHELF=&DT=19920626112004&CASE=
    const highlighting = [
      SFID.QUERY_REPLY,
      QCode.HIGHLIGHTING,
      // the rest from x3270 tcpdump
      ...bytesFromDump('05 00f0 f1f1 f2f2 f4f4 f8f8')
    ];
    ostream.put16(highlighting.length + 2);
    ostream.putBytes(highlighting);
    // next reply modes
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.42.2?SHELF=&DT=19920626112004&CASE=
    const replyModes = [
      SFID.QUERY_REPLY,
      QCode.REPLY_MODES,
      0x00, // field mode
      0x01, // extended field mode
      0x02  // character mode
    ];
    ostream.put16(replyModes.length + 2);
    ostream.putBytes(replyModes);
    // next DDM
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.19.2?SHELF=&DT=19920626112004&CASE=
    const ddm = [
      SFID.QUERY_REPLY,
      QCode.DDM,
      // the rest from x3270 tcpdump
      ...bytesFromDump('00 0010 0010 0001 01')
    ];
    ostream.put16(ddm.length + 2);
    ostream.putBytes(ddm);
    // next rpq names
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.43.2?SHELF=&DT=19920626112004&CASE=
    const rpqNames = [
      SFID.QUERY_REPLY,
      QCode.RPQ_NAMES,
      // the rest from x3270 tcpdump
      ...bytesFromDump('00 0000 0000 0000 0006 a7f3 f2f7 f0')
    ];
    ostream.put16(rpqNames.length + 2);
    ostream.putBytes(rpqNames);
    // next implicit partition
    // http://publibz.boulder.ibm.com/cgi-bin/bookmgr_OS390/BOOKS/
    //   CN7P4000/6.43.2?SHELF=&DT=19920626112004&CASE=
    const implicitPartition = [
      SFID.QUERY_REPLY,
      QCode.IMPLICIT_PARTITION,
      // the rest from x3270 tcpdump
      ...bytesFromDump('00 000b 0100 0050 0018 0050 002b')
    ];
    ostream.put16(implicitPartition.length + 2);
    ostream.putBytes(implicitPartition);
    // we're done!
    ostream.putBytes(LT);
    const data: Uint8Array = ostream.toArray();
    dump(data, '3270 -> Host (qcodes)', true, 'purple');
  }

  private submitHandler(aid: AID,
                        cursorAt: number,
                        cells: Cell[]): Uint8Array {
    const ostream = new OutputDataStream();
    ostream.put(aid);
    ostream.putBytes(addressToBytes(cursorAt));
    // group all the modified cells to form fields
    // adjacent unprotected fields are grouped as a field
    const modifiedByID: {[s: string]: { at: number, value: string }} = {};
    let fieldNum = 0;
    cells.forEach((cell, ix) => {
      if (cell.attributes.protect)
        fieldNum += 1;
      else if (cell.value && cell.attributes.modified) {
        const fieldID = `id${fieldNum}`;
        let modified = modifiedByID[fieldID];
        if (!modified) {
          modified = {at: 0, value: ''};
          modifiedByID[fieldID] = modified;
        }
        if (!modified.at)
          modified.at = ix;
        modified.value += cell.value;
      }
    });
    // now convert them to SBA/SF sequences
    Object.keys(modifiedByID).forEach(id => {
      const modified = modifiedByID[id];
      ostream.put(Order.SBA);
      ostream.putBytes(addressToBytes(modified.at));
      ostream.put(Order.SF);
      ostream.putBytes(a2e(modified.value));
    });
    ostream.putBytes(LT);
    const data: Uint8Array = ostream.toArray();
    dump(data, '3270 -> Host (submit)', true, 'magenta');
    return data;
  }

  private writeCommands(istream: InputDataStream,
                        actions: any[]): void {
    let retVal: { wcc?: WCC, cells?: Cell[] } = {};
    // setup decode indexes
    this.address = 0;
    this.attributes = new Attributes();
    this.cursorAt = null;
    const command = istream.next();
    switch (command) {
      case Command.EAU:
        retVal = this.writeOrdersAndData(command, istream);
        actions.push(new EraseUnprotectedScreen({ cells: retVal.cells }));
        break;
      case Command.EW:
      case Command.EWA:
        this.cursorAt = 0;
        retVal = this.writeOrdersAndData(command, istream, true);
        actions.push(new ReplaceScreen({ cells: retVal.cells }));
        break;
      case Command.W:
        retVal = this.writeOrdersAndData(command, istream);
        actions.push(new UpdateScreen({ cells: retVal.cells }));
        break;
      case Command.WSF:
        this.writeStructuredFields(istream);
        // TODO: qcodes
        break;
      case Command.RB:
      case Command.RM:
      case Command.RMA:
        console.log(`%cCommand 0x${toHex(command, 2)} oh oh!`, 'color: red');
        break;
    }
    // process any cursor position
    if (this.cursorAt != null)
      actions.push(new CursorAt(this.cursorAt));
    // process the WCC
    if (retVal.wcc && retVal.wcc.resetMDT)
      actions.push(new ResetMDT());
    if (retVal.wcc && retVal.wcc.unlockKeyboard)
      actions.push(new KeyboardLocked(false));
  }

  private writeOrdersAndData(command: Command,
                             istream: InputDataStream,
                             fill = false): { wcc: WCC, cells: Cell[] } {
    // these are the individual cells on the screen
    // we fill with dummy protrcted fields on erase
    const cells = this.initCells(fill);
    const wcc = WCC.fromByte(istream.next());
    const log = [];
    while (istream.hasNext()) {
      const order = istream.next();
      let unsupported = false;
      switch (order) {
        case Order.SF:
          this.attributes = Attributes.fromByte(istream.next());
          cells[this.address++] = new Cell(null, new Attributes(true));
          break;
        case Order.SFE:
          const count = istream.next() * 2;
          this.attributes = Attributes.fromBytes(istream.nextBytes(count));
          cells[this.address++] = new Cell(null, new Attributes(true));
          break;
        case Order.SBA:
          this.address = addressFromBytes([istream.next(), istream.next()]);
          break;
        case Order.SA:
          const typeCode = istream.peek();
          const attributes = Attributes.fromBytes(istream.nextBytes(2));
          this.attributes.modify(typeCode, attributes);
          break;
        case Order.MF:
          unsupported = true;
          break;
        case Order.IC:
          this.cursorAt = this.address;
          break;
        case Order.PT:
          unsupported = true;
          break;
        case Order.RA:
          const repeatTo = addressFromBytes([istream.next(), istream.next()]);
          const byte = istream.next();
          const value = (byte === 0x00)? null : e2a([byte]);
          const ra = (from, to) => {
            while (from < to)
              cells[from++] = new Cell(value, this.attributes);
          };
          if (this.address === repeatTo)
            ra(0, this.numCols * this.numRows);
          else if (this.address < repeatTo)
            ra(this.address, repeatTo);
          else {
            ra(this.address, this.numCols * this.numRows);
            ra(0, repeatTo);
          }
          this.address = repeatTo;
          break;
        case Order.EUA:
          unsupported = true;
          break;
        default:
          // if it isn't an order, then treat it as data
          if ((order === 0x00) || (order >= 0x40)) {
            const value = (order === 0x00)? null : e2a([order]);
            cells[this.address++] = new Cell(value, this.attributes);
          }
          else unsupported = true;
      }
      // stash log data for the orders
      const row = Math.trunc(this.address / this.numCols) + 1;
      const col = (this.address % this.numCols) + 1;
      const lookup = OrderLookup[order];
      if (lookup)
        log.push({row, col, order: lookup, hex: `0x${toHex(order, 2)}`, attributes: this.attributes.toString(), supported: unsupported? 'NO' : ''});
    }
    // log the command and any orders
    console.table([{command: CommandLookup[command], hex: `0x${toHex(command, 2)}`, wcc: wcc.toString()}]);
    if (log.length)
      console.table(log);
    return { wcc, cells };
  }

  private writeStructuredFields(istream: InputDataStream): void {
    while (istream.hasNext()) {
      const length = istream.next16();
      if (!istream.hasEnough(length))
        break;
      const sfid: SFID = istream.next();
      // NOTE: there are a million SFIDs and we handle only what we need
      switch (sfid) {
        case SFID.READ_PARTITION:
          this.sendQCodes();
          break;
        default:
          break;
      }
    }
  }

}
