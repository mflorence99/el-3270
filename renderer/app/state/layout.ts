import { Action } from '@ngxs/store';
import { State } from '@ngxs/store';
import { StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class ShowKeyboard {
  static readonly type = '[Layout] show keyboard';
  constructor(public readonly payload: boolean) { }
}

export interface LayoutStateModel {
  showKeyboard: boolean;
}

@State<LayoutStateModel>({
  name: 'layout',
  defaults: {
    showKeyboard: false
  }
}) export class LayoutState {

  @Action(ShowKeyboard)
  showKeyboard({ getState, patchState }: StateContext<LayoutStateModel>,
               { payload }: ShowKeyboard) {
    patchState( {showKeyboard: payload });
  }

}
