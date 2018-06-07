import { Action, State, StateContext } from '@ngxs/store';
import { Alarm, CursorAt, ErrorMessage, KeyboardLocked } from './status';

import { Attributes } from '../services/attributes';
import { Cell } from '../services/cell';

/** NOTE: actions must come first because of AST */

export class ClearCellValue {
  static readonly type = '[Screen] clear cell value';
  constructor(public readonly payload: number) { }
}

export class EraseUnprotected {
  static readonly type = '[Screen] erase unprotected';
  constructor(public readonly payload: { from, to }) { }
}

export class EraseUnprotectedScreen {
  static readonly type = '[Screen] erase unprotected screen';
  constructor(public readonly payload?: any) { }
}

export class ReplaceScreen {
  static readonly type = '[Screen] replace screen';
  constructor(public readonly payload: ScreenStateModel) { }
}

export class ResetMDT {
  static readonly type = '[Screen] reset MDT';
  constructor(public readonly payload?: any) { }
}

export class UpdateCellAttributes {
  static readonly type = '[Screen] update cell attributes';
  constructor(public readonly payload: { cellAt, typeCode, attributes }) { }
}

export class UpdateCellValue {
  static readonly type = '[Screen] update cell value';
  constructor(public readonly payload: { cursorAt, value }) { }
}

export class UpdateScreen {
  static readonly type = '[Screen] update screen';
  constructor(public readonly payload: ScreenStateModel) { }
}

export interface ScreenStateModel {
  cells: Cell[];
}

@State<ScreenStateModel>({
  name: 'screen',
  defaults: {
    cells: []
  }
}) export class ScreenState {

  @Action(ClearCellValue)
  clearCellValue({ dispatch, getState, setState }: StateContext<ScreenStateModel>,
                 { payload }: ClearCellValue) {
    const state = getState();
    state.cells = state.cells.slice(0);
    const cell = state.cells[payload];
    if (cell.attribute || cell.attributes.protect) {
      dispatch([new ErrorMessage('PROT'),
                new KeyboardLocked(true),
                new Alarm(true)]);
    }
    else {
      cell.attributes.modified = false;
      cell.value = null;
      setState({ ...state });
    }
  }

  @Action(EraseUnprotected)
  eraseUnprotected({ getState, setState }: StateContext<ScreenStateModel>,
                   { payload }: EraseUnprotected) {
    const state = getState();
    state.cells = state.cells.slice(0);
    let attributes;
    state.cells
      // awkward! we have to reset all the character attrributes too
      .filter(cell => {
        if (cell.attribute)
          attributes = cell.attributes;
        return true;
      })
      .filter(cell => cell && !(cell.attribute || cell.attributes.protect))
      .filter((cell, ix) => (ix >= payload.from) && (ix < payload.to))
      .forEach(cell =>  {
        cell.attributes = Attributes.from(attributes);
        cell.value = null;
      });
    setState({ ...state });
  }

  @Action(EraseUnprotectedScreen)
  eraseUnprotectedScreen({ getState, setState }: StateContext<ScreenStateModel>,
                         { payload }: EraseUnprotectedScreen) {
    const state = getState();
    state.cells = state.cells.slice(0);
    state.cells
      .filter(cell => cell && !(cell.attribute || cell.attributes.protect))
      .forEach(cell =>  {
        cell.attributes.modified = false;
        cell.value = null;
      });
    setState({ ...state });
  }

  @Action(ReplaceScreen)
  replaceScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: ReplaceScreen) {
    const state = getState();
    state.cells = state.cells.slice(0);
    payload.cells.forEach((cell, ix) => {
      state.cells[ix] = cell;
    });
    this.propagateUnprotected(state.cells);
    setState({ ...state });
  }

  @Action(ResetMDT)
  resetMDT({ getState, setState }: StateContext<ScreenStateModel>,
           { payload }: ResetMDT) {
    const state = getState();
    state.cells = state.cells.slice(0);
    state.cells.forEach(cell =>  {
      cell.attributes.modified = false;
    });
    setState({ ...state });
  }

  @Action(UpdateCellAttributes)
  updateCellAttributes({ getState, setState }: StateContext<ScreenStateModel>,
                       { payload }: UpdateCellAttributes) {
    const state = getState();
    state.cells = state.cells.slice(0);
    const cell = state.cells[payload.cellAt];
    cell.attributes.modify(payload.typeCode, payload.attributes);
    setState({ ...state });
  }

  @Action(UpdateCellValue)
  updateCellValue({ dispatch, getState, setState }: StateContext<ScreenStateModel>,
                  { payload }: UpdateCellValue) {
    const state = getState();
    state.cells = state.cells.slice(0);
    const cell = state.cells[payload.cursorAt];
    if (cell.attribute || cell.attributes.protect) {
      dispatch([new ErrorMessage('PROT'),
                new KeyboardLocked(true),
                new Alarm(true)]);
    }
    else if (cell.attributes.numeric && !payload.value.match(/[0-9],\.-/g)) {
      dispatch([new ErrorMessage('NUM'),
                new KeyboardLocked(true),
                new Alarm(true)]);
    }
    else {
      cell.attributes.modified = true;
      cell.value = payload.value;
      dispatch(new CursorAt(payload.cursorAt + 1));
      setState({ ...state });
    }
  }

  @Action(UpdateScreen)
  updateScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: UpdateScreen) {
    const state = getState();
    state.cells = state.cells.slice(0);
    payload.cells.forEach((cell, ix) => {
      if (cell)
        state.cells[ix] = cell;
    });
    this.propagateUnprotected(state.cells);
    setState({ ...state });
  }

  // private methods

  private propagateUnprotected(cells: Cell[]): void {
    let attributes: Attributes = null;
    cells.forEach(cell => {
      if (cell.attribute)
        attributes = cell.attributes.protect? null : cell.attributes;
      else if (!cell.value && attributes)
        cell.attributes = Attributes.from(attributes);
    });
  }

}
