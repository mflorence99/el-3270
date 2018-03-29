import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class UpdatePrefs {
  constructor(public readonly payload: PrefsStateModel) {}
}

export interface PrefsStateModel {
  host: string;
  port: number;
  model: string;
  color: string;
  submitted?: boolean;
}

@State<PrefsStateModel>({
  name: 'prefs',
  defaults: {} as PrefsStateModel
}) export class PrefsState {

  @Action(UpdatePrefs)
  updatePrefs({ getState, setState }: StateContext<PrefsStateModel>,
              { payload }: UpdatePrefs) {
    setState({...getState(), ...payload});
  }

}
