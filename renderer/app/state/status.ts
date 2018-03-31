import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Connected {
  constructor(public readonly payload: boolean) {}
}

export class CursorAt {
  constructor(public readonly payload: number) {}
}

export class Waiting {
  constructor(public readonly payload: boolean) {}
}

export interface StatusStateModel {
  connected: boolean;
  cursorAt: number;
  waiting: boolean;
}

@State<StatusStateModel>({
  name: 'status',
  defaults: {} as StatusStateModel
}) export class StatusState {

  @Action(Connected)
  connected({ getState, patchState }: StateContext<StatusStateModel>,
            { payload }: Connected) {
    patchState({connected: payload});
  }

  @Action(CursorAt)
  cursorAt({ getState, patchState }: StateContext<StatusStateModel>,
            { payload }: CursorAt) {
    patchState({cursorAt: payload});
  }

  @Action(Waiting)
  waiting({ getState, patchState }: StateContext<StatusStateModel>,
          { payload }: Waiting) {
    patchState({waiting: payload});
  }

}
