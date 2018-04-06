import { AID, Command, Op, Order, QCode, SFID } from './types';
import { AIDLookup, CommandLookup, LT, OpLookup, SFIDLookup } from './constants';
import { ApplicationRef, Injectable } from '@angular/core';
import { Connected, CursorAt, ErrorMessage, Focused, KeyboardLocked, Waiting } from '../state/status';
import { EraseUnprotectedScreen, ReplaceScreen, ResetMDT, UpdateScreen } from '../state/screen';
import { InputDataStream, OutputDataStream } from './data-stream';
import { a2e, e2a } from 'ellib/lib/utils/convert';
import { addressFromBytes, addressToBytes, bytesFromDump } from './utils';
import { dump, toHex } from 'ellib/lib/utils';

import { Attributes } from './attributes';
import { Cell } from './cell';
import { ElectronService } from 'ngx-electron';
import { ScreenStateModel } from '../state/screen';
import { StatusStateModel } from '../state/status';
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

  screenSnapshot: ScreenStateModel;
  statusSnapshot: StatusStateModel;

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
    this.electron.ipcRenderer.on('focused', this.focusHandler.bind(this));
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
           cursorOp: 'down' | 'left' | 'right' | 'up'): void {
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
    this.store.dispatch(new CursorAt(cursorTo));
  }

  /** Disconnect from host */
  disconnect(): void {
    this.store.dispatch(new Waiting(true));
    this.electron.ipcRenderer.send('disconnect');
  }

  /** Simulate print screen */
  print(): void {
    this.electron.ipcRenderer.send('print');
  }

  /** Reposition cursor, relative to its current position */
  tabTo(cursorAt: number,
        cells: Cell[],
        tabOp: 'bwd' | 'fwd'): void {
    const max = this.numCols * this.numRows;
    let dir = 1, tabTo = cursorAt;
    // if we're going backwards, and we're at the beginning of a field
    // we'll skip this field
    if (tabOp === 'bwd') {
      dir = -1;
      if ((cursorAt > 0) && cells[cursorAt - 1].attribute)
        tabTo -= 1;
    }
    // now look for the first unprotected field
    while (true) {
      tabTo += dir;
      if (tabTo === cursorAt)
        break;
      if (tabTo < 0)
        tabTo = max - 1;
      if (tabTo >= max)
        tabTo = 1;
      const cell = cells[tabTo - 1];
      if (cell && cell.attribute && !cell.attributes.protect)
        break;
    }
    if (tabTo !== cursorAt)
      this.store.dispatch(new CursorAt(tabTo));
  }

  /** Submit screen to host */
  submit(aid: AID,
         cursorAt: number,
         cells: Cell[]): void {
    const data = this.readModified(aid, cursorAt, cells);
    this.store.dispatch(new Waiting(true));
    this.electron.ipcRenderer.send('write', data);
    this.application.tick();
  }

  // private methods

  private addressAsRowCol(address: number): string {
    const row = Math.trunc(address / this.numCols) + 1;
    const col = (address % this.numCols) + 1;
    return `${row}/${col}`;
  }

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
    dump(data, 'Host -> 3270', true, 'maroon');
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
    this.application.tick();
  }

  private focusHandler(event: any,
                       focused: boolean): void {
    this.store.dispatch(new Focused(focused));
    this.application.tick();
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

  private logInboundOrders(istream: InputDataStream): void {
    const aid: AID = istream.next();
    const cursorAt = addressFromBytes([istream.next(), istream.next()]);
    console.groupCollapsed(`%c3270 -> Host Command ${AIDLookup[aid]} Cursor ${this.addressAsRowCol(cursorAt)} [${cursorAt}]`, 'color: olive');
    let address, attributes, chars = [];
    while (istream.hasNext()) {
      const order = istream.next();
      // log actual data
      if ((order !== 0x00) && (order < 0x40)) {
        if (chars.length)
          console.log(`%c===> %c${chars.join('')}`, 'color: gray', 'color: olive');
        chars = [];
      }
      // log order
      switch (order) {
        case Order.SF:
          attributes = Attributes.fromByte(istream.next());
          console.log(`%cSF %c${attributes.toString()}`, 'color: black', 'color: gray');
          break;
        case Order.SBA:
          address = addressFromBytes([istream.next(), istream.next()]);
          console.log(`%cSBA %c${this.addressAsRowCol(address)} [${address}]`, 'color: black', 'color: gray');
          break;
        default:
          if ((order === 0x00) || (order >= 0x40))
            chars.push((order === 0x00)? '\u2022' : e2a([order]));
      }
    }
    // any remaining chars
    if (chars.length)
      console.log(`%c===> %c${chars.join('')}`, 'color: gray', 'color: olive');
    console.groupEnd();
  }

  private logOutboundOrders(istream: InputDataStream): void {
    const command: Command = istream.next();
    const wcc = WCC.fromByte(istream.next());
    console.groupCollapsed(`%cHost -> 3270 Command ${CommandLookup[command]} ${wcc.toString()}`, 'color: brown');
    let address, attributes, count, value, chars = [];
    while (istream.hasNext()) {
      const order = istream.next();
      // log actual data
      if ((order !== 0x00) && (order < 0x40)) {
        if (chars.length)
          console.log(`%c===> %c${chars.join('')}`, 'color: gray', 'color: brown');
        chars = [];
      }
      // log order
      switch (order) {
        case Order.SF:
          attributes = Attributes.fromByte(istream.next());
          console.log(`%cSF %c${attributes.toString()}`, 'color: black', 'color: gray');
          break;
        case Order.SFE:
          count = istream.next() * 2;
          attributes = Attributes.fromBytes(istream.nextBytes(count));
          console.log(`%cSFE %c${attributes.toString()}`, 'color: black', 'color: gray');
          break;
        case Order.SBA:
          address = addressFromBytes([istream.next(), istream.next()]);
          console.log(`%cSBA %c${this.addressAsRowCol(address)} [${address}]`, 'color: black', 'color: gray');
          break;
        case Order.MF:
          count = istream.next() * 2;
          attributes = Attributes.fromBytes(istream.nextBytes(count));
          console.log(`%cMF %c${attributes.toString()}`, 'color: black', 'color: gray');
          break;
        case Order.IC:
          console.log('%cIC', 'color: black');
          break;
        case Order.PT:
          console.log('%cPT', 'color: black');
          break;
        case Order.SA:
          attributes = Attributes.fromBytes(istream.nextBytes(2));
          console.log(`%cSA %c${attributes.toString()}`, 'color: black', 'color: gray');
          break;
        case Order.RA:
          address = addressFromBytes([istream.next(), istream.next()]);
          const byte = istream.next();
          value = (byte === 0x00)? null : e2a([byte]);
          console.log(`%cRA %c${this.addressAsRowCol(address)} ${value}`, 'color: black', 'color: gray');
          break;
        case Order.EUA:
          address = addressFromBytes([istream.next(), istream.next()]);
          console.log(`%cEUA %c${this.addressAsRowCol(address)}, 'color: black', 'color: gray'`);
          break;
        default:
          if ((order === 0x00) || (order >= 0x40))
            chars.push((order === 0x00)? '\u2022' : e2a([order]));
          else console.log(`%cOrder ${toHex(order, 2)} unrecognized`, 'color: red');
      }
    }
    // any remaining chars
    if (chars.length)
      console.log(`%c===> %c${chars.join('')}`, 'color: gray', 'color: brown');
    console.groupEnd();
  }

  private logOutboundStructuredFields(istream: InputDataStream): void {
    const command: Command = istream.next();
    console.groupCollapsed(`%cHost -> 3270 ${CommandLookup[command]}`, `color: #7D0552`);
    while (istream.hasNext()) {
      // NOTE: we observe a malformed READ_PARTITION stream
      // TODO: not sure if it is real
      const length = istream.next16();
      if (!istream.hasEnough(length))
        break;
      const sfid: SFID = istream.next();
      console.log(`%c${SFIDLookup[sfid]} %cLEN=${length}`, 'color: black', 'color: gray');
      switch (sfid) {
        case SFID.READ_PARTITION:
          const op: Op = istream.next();
          console.log(`%cOp %c${OpLookup[op]}`, 'color: black', 'color: gray');
          break;
      }
    }
    console.groupEnd();
  }

  private readBuffer(aid: AID,
                     cursorAt: number,
                     cells: Cell[]): Uint8Array {
    const ostream = new OutputDataStream();
    ostream.put(aid);
    ostream.putBytes(addressToBytes(cursorAt));
    // TODO: we currently ONLY support field mode -- see readQCodes
    cells.forEach(cell => {
      if (cell.attribute) {
        ostream.put(Order.SF);
        ostream.put(cell.attributes.toByte());
      }
      else ostream.putBytes(a2e(cell.value));
    });
    ostream.putBytes(LT);
    const data: Uint8Array = ostream.toArray();
    dump(data, '3270 -> Host Read Buffer', true, '#347235');
    // dump the orders
    const slice = data.slice(0, data.length - LT.length);
    this.logInboundOrders(new InputDataStream(slice));
    return data;
  }

  private readModified(aid: AID,
                       cursorAt: number,
                       cells: Cell[],
                       all = false): Uint8Array {
    const ostream = new OutputDataStream();
    ostream.put(aid);
    if (all || ![AID.CLEAR, AID.PA1, AID.PA2, AID.PA3].includes(aid)) {
      ostream.putBytes(addressToBytes(cursorAt));
      // adjacent unprotected fields are grouped as a field
      let address = null;
      let chars = [];
      // TODO: we currently ONLY support field mode -- see readQCodes
      cells.forEach((cell, ix) => {
        if (cell.attribute || cell.attributes.protect) {
          if (address) {
            ostream.put(Order.SBA);
            ostream.putBytes(addressToBytes(address));
            ostream.putBytes(a2e(chars.join('')));
            address = null;
            chars = [];
          }
        }
        else if (cell.value && cell.attributes.modified) {
          if (address == null)
            address = ix;
          chars[ix - address] = cell.value;
        }
      });
    }
    ostream.putBytes(LT);
    const data: Uint8Array = ostream.toArray();
    dump(data, `3270 -> Host Read Modified ${all? 'All' : ''}`, true, 'green');
    // dump the orders
    const slice = data.slice(0, data.length - LT.length);
    this.logInboundOrders(new InputDataStream(slice));
    return data;
  }

  private readModifiedAll(aid: AID,
                          cursorAt: number,
                          cells: Cell[]): Uint8Array {
    return this.readModified(aid, cursorAt, cells, true);
  }

  private readQCodes(): Uint8Array {
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
    // TODO: we currently ONLY support field mode
    // see readBuffer, readModified and readModifiedAll
    const replyModes = [
      SFID.QUERY_REPLY,
      QCode.REPLY_MODES,
      0x00, // field mode
      // 0x01, // extended field mode
      // 0x02  // character mode
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
    const rpqName: number[] = a2e('EL-3270');
    const rpqNames = [
      SFID.QUERY_REPLY,
      QCode.RPQ_NAMES,
      ...bytesFromDump('00 0000 0000 0000 00'),
      rpqName.length + 1,
      ...rpqName
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
    dump(data, '3270 -> Host QCodes', true, 'purple');
    return data;
  }

  private writeCommands(istream: InputDataStream,
                        actions: any[]): void {
    let retVal: { wcc?: WCC, cells?: Cell[] } = {};
    // setup decode indexes
    this.attributes = new Attributes();
    this.cursorAt = null;
    const command: Command = istream.next();
    switch (command) {
      case Command.EAU:
        retVal = this.writeOrdersAndData(istream);
        actions.push(new EraseUnprotectedScreen({ cells: retVal.cells }));
        break;
      case Command.EW:
      case Command.EWA:
        this.address = 0;
        this.cursorAt = 0;
        retVal = this.writeOrdersAndData(istream, true);
        actions.push(new ReplaceScreen({ cells: retVal.cells }));
        break;
      case Command.W:
        retVal = this.writeOrdersAndData(istream);
        actions.push(new UpdateScreen({ cells: retVal.cells }));
        break;
      case Command.WSF:
        this.writeStructuredFields(istream);
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

  private writeOrdersAndData(istream: InputDataStream,
                             fill = false): { wcc: WCC, cells: Cell[] } {
    this.logOutboundOrders(InputDataStream.from(istream));
    // these are the individual cells on the screen
    // we fill with dummy protected fields on erase
    const cells = this.initCells(fill);
    const wcc = WCC.fromByte(istream.next());
    while (istream.hasNext()) {
      const order = istream.next();
      switch (order) {
        case Order.SF:
          this.attributes = Attributes.fromByte(istream.next());
          cells[this.address++] = new Cell(null, this.attributes, true);
          break;
        case Order.SFE:
          const count = istream.next() * 2;
          this.attributes = Attributes.fromBytes(istream.nextBytes(count));
          cells[this.address++] = new Cell(null, this.attributes, true);
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
          break;
        case Order.IC:
          this.cursorAt = this.address;
          break;
        case Order.PT:
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
          break;
        default:
          // if it isn't an order, then treat it as data
          if ((order === 0x00) || (order >= 0x40)) {
            const value = (order === 0x00)? null : e2a([order]);
            cells[this.address++] = new Cell(value, this.attributes);
          }
      }
    }
    return { wcc, cells };
  }

  private writeStructuredFields(istream: InputDataStream): void {
    this.logOutboundStructuredFields(InputDataStream.from(istream));
    while (istream.hasNext()) {
      // NOTE: we observe a malformed READ_PARTITION stream
      // TODO: not sure if it is real
      const length = istream.next16();
      if (!istream.hasEnough(length))
        break;
      // NOTE: there are a million SFIDs and we handle only what we need
      const sfid: SFID = istream.next();
      let data: Uint8Array = null;
      switch (sfid) {
        case SFID.READ_PARTITION:
          const op: Op = istream.next();
          switch (op) {
            case Op.RB:
              if (this.screenSnapshot && this.statusSnapshot) {
                const cursorAt = this.statusSnapshot.cursorAt;
                const cells = this.screenSnapshot.cells;
                data = this.readBuffer(AID.DEFAULT, cursorAt, cells);
              }
              break;
            case Op.RM:
              if (this.screenSnapshot && this.statusSnapshot) {
                const cursorAt = this.statusSnapshot.cursorAt;
                const cells = this.screenSnapshot.cells;
                data = this.readModified(AID.DEFAULT, cursorAt, cells);
              }
              break;
            case Op.RMA:
              if (this.screenSnapshot && this.statusSnapshot) {
                const cursorAt = this.statusSnapshot.cursorAt;
                const cells = this.screenSnapshot.cells;
                data = this.readModifiedAll(AID.DEFAULT, cursorAt, cells);
              }
              break;
            // this is the case we don't understand: f3 0005 01ff ff 02
            // it looks like one extra 0xff before the Q op code of 0x012
            case Op.Q:
            case Op.QL:
            default:
              data = this.readQCodes();
              break;
          }
          break;
      }
      // write gathered data back to host
      if (data)
        this.electron.ipcRenderer.send('write', data);
    }
  }

}
