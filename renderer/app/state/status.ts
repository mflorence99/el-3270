import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Alarm {
  static readonly type = '[Status] alarm';
  constructor(public readonly payload: boolean) { }
}

export class Connected {
  static readonly type = '[Status] connected';
  constructor(public readonly payload: boolean) { }
}

export class CursorAt {
  static readonly type = '[Status] cursor at';
  constructor(public readonly payload: number) { }
}

export class ErrorMessage {
  static readonly type = '[Status] error message';
  constructor(public readonly payload: string) { }
}

export class Focused {
  static readonly type = '[Status] focused';
  constructor(public readonly payload: boolean) { }
}

export class KeyboardLocked {
  static readonly type = '[Status] keyboard locked';
  constructor(public readonly payload: boolean) { }
}

export class Waiting {
  static readonly type = '[Status] waiting';
  constructor(public readonly payload: boolean) { }
}

export interface StatusStateModel {
  alarm: boolean;
  connected: boolean;
  cursorAt: number;
  error: boolean;
  focused: boolean;
  keyboardLocked: boolean;
  message: string;
  waiting: boolean;
}

@State<StatusStateModel>({
  name: 'status',
  defaults: {
    alarm: false,
    connected: false,
    cursorAt: 0,
    error: false,
    focused: false,
    keyboardLocked: false,
    message: '',
    waiting: false
  }
}) export class StatusState {

  @Action(Alarm)
  alarm({ getState, patchState }: StateContext<StatusStateModel>,
        { payload }: Alarm) {
    patchState({alarm: payload});
  }

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

  @Action(Focused)
  focused({ getState, patchState }: StateContext<StatusStateModel>,
          { payload }: Focused) {
    patchState({focused: payload});
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
