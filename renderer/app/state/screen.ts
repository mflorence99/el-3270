import { Action, State, StateContext, Store } from '@ngxs/store';
import { CursorAt, ErrorMessage, KeyboardLocked } from './status';

import { Attributes } from '../services/attributes';
import { Cell } from '../services/cell';

/** NOTE: actions must come first because of AST */

export class ClearCellValue {
  constructor(public readonly payload: number) {}
}

export class EraseUnprotectedScreen {
  constructor(public readonly payload: ScreenStateModel) {}
}

export class ReplaceScreen {
  constructor(public readonly payload: ScreenStateModel) {}
}

export class ResetMDT {
  constructor(public readonly payload: any = null) {}
}

export class UpdateCellValue {
  constructor(public readonly payload: {cursorAt, value}) {}
}

export class UpdateScreen {
  constructor(public readonly payload: ScreenStateModel) {}
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

  constructor(private store: Store) { }

  @Action(ClearCellValue)
  clearCellValue({ getState, setState }: StateContext<ScreenStateModel>,
                 { payload }: ClearCellValue) {
    const updated = { ...getState() };
    const cell = updated.cells[payload - 1];
    if (cell.attribute || cell.attributes.protect)
      this.store.dispatch([new ErrorMessage('PROT'), new KeyboardLocked(true)]);
    else {
      cell.attributes.modified = false;
      cell.value = null;
      this.store.dispatch(new CursorAt(payload - 1));
      setState({...updated});
    }
  }

  @Action(EraseUnprotectedScreen)
  eraseUnprotectedScreen({ getState, setState }: StateContext<ScreenStateModel>,
                         { payload }: EraseUnprotectedScreen) {
    const erased = { ...getState() };
    erased.cells
      .filter(cell => cell && !(cell.attribute || cell.attributes.protect))
      .forEach(cell =>  {
        cell.attributes.modified = false;
        cell.value = null;
      });
    setState({...erased, ...payload});
  }

  @Action(ReplaceScreen)
  replaceScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: ReplaceScreen) {
    const replaced = { ...getState() };
    payload.cells.forEach((cell, ix) => {
      replaced.cells[ix] = cell;
    });
    this.propagateUnprotected(replaced.cells);
    setState({...replaced});
  }

  @Action(ResetMDT)
  resetMDT({ getState, setState }: StateContext<ScreenStateModel>,
           { payload }: ResetMDT) {
    const reset = { ...getState() };
    reset.cells.forEach(cell =>  {
      cell.attributes.modified = false;
    });
    setState({...reset});
  }

  @Action(UpdateCellValue)
  updateCellValue({ getState, setState }: StateContext<ScreenStateModel>,
                  { payload }: UpdateCellValue) {
    const updated = { ...getState() };
    const cell = updated.cells[payload.cursorAt];
    if (cell.attribute || cell.attributes.protect)
      this.store.dispatch([new ErrorMessage('PROT'), new KeyboardLocked(true)]);
    else if (cell.attributes.numeric && !payload.value.match(/[0-9],\.-/g))
      this.store.dispatch([new ErrorMessage('NUM'), new KeyboardLocked(true)]);
    else {
      cell.attributes.modified = true;
      cell.value = payload.value;
      this.store.dispatch(new CursorAt(payload.cursorAt + 1));
      setState({...updated});
    }
  }

  @Action(UpdateScreen)
  updateScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: UpdateScreen) {
    const updated = { ...getState() };
    payload.cells.forEach((cell, ix) => {
      if (cell)
        updated.cells[ix] = cell;
    });
    this.propagateUnprotected(updated.cells);
    setState({...updated});
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
