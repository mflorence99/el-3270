import { Action, State, StateContext } from '@ngxs/store';

import { Cell } from '../services/data-stream';

/** NOTE: actions must come first because of AST */

export class UpdateScreen {
  constructor(public readonly payload: ScreenStateModel) {}
}

export interface ScreenStateModel {
  cells: Cell[];
}

@State<ScreenStateModel>({
  name: 'screen',
  defaults: {} as ScreenStateModel
}) export class ScreenState {

  @Action(UpdateScreen)
  updateScreen({ getState, setState }: StateContext<ScreenStateModel>,
               { payload }: UpdateScreen) {
    setState({...getState(), ...payload});
  }

}
