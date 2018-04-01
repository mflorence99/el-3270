import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Connected {
  constructor(public readonly payload: boolean) {}
}

export class CursorAt {
  constructor(public readonly payload: number) {}
}

export class ErrorMessage {
  constructor(public readonly payload: string) {}
}

export class KeyboardLocked {
  constructor(public readonly payload: boolean) {}
}

export class Waiting {
  constructor(public readonly payload: boolean) {}
}

export interface StatusStateModel {
  connected: boolean;
  cursorAt: number;
  error: boolean;
  keyboardLocked: boolean;
  message: string;
  waiting: boolean;
}

@State<StatusStateModel>({
  name: 'status',
  defaults: {
    connected: false,
    cursorAt: 0,
    error: false,
    keyboardLocked: false,
    message: '',
    waiting: false
  }
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

  @Action(ErrorMessage)
  errorMessage({ getState, patchState }: StateContext<StatusStateModel>,
               { payload }: ErrorMessage) {
    patchState({error: !!payload, message: payload});
  }

  @Action(KeyboardLocked)
  keyboardLocked({ getState, patchState }: StateContext<StatusStateModel>,
                 { payload }: KeyboardLocked) {
    patchState({keyboardLocked: payload});
  }

  @Action(Waiting)
  waiting({ getState, patchState }: StateContext<StatusStateModel>,
          { payload }: Waiting) {
    patchState({waiting: payload});
  }

}
