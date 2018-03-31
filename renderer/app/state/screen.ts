import { Action, State, StateContext } from '@ngxs/store';

import { Cell } from '../services/data-stream';

/** NOTE: actions must come first because of AST */

export class EraseUnprotectedScreen {
  constructor(public readonly payload: ScreenStateModel) {}
}

export class ReplaceScreen {
  constructor(public readonly payload: ScreenStateModel) {}
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

  @Action(EraseUnprotectedScreen)
  eraseUnprotectedScreen({ getState, setState }: StateContext<ScreenStateModel>,
                         { payload }: EraseUnprotectedScreen) {
    const erased = { ...getState() };
    erased.cells
      .filter(cell => cell && !cell.attributes.protect)
      .forEach(cell =>   cell.value = null);
    setState({...erased, ...payload});
  }

  @Action(ReplaceScreen)
  replaceScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: ReplaceScreen) {
    setState({...getState(), ...payload});
  }

  @Action(UpdateScreen)
  updateScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: UpdateScreen) {
    const updated = { ...getState() };
    payload.cells.forEach((cell, ix) => {
      updated.cells[ix] = cell;
    });
    setState({...updated});
  }

}
