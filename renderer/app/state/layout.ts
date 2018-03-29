import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class ShowKeyboard {
  constructor(public readonly payload: boolean) {}
}

export interface LayoutStateModel {
  showKeyboard: boolean;
}

@State<LayoutStateModel>({
  name: 'layout',
  defaults: {} as LayoutStateModel
}) export class LayoutState {

  @Action(ShowKeyboard)
  showKeyboard({ getState, patchState }: StateContext<LayoutStateModel>,
               { payload }: ShowKeyboard) {
    patchState({showKeyboard: payload});
  }

}
