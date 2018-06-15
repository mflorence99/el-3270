import { Action } from '@ngxs/store';
import { State } from '@ngxs/store';
import { StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class UpdatePrefs {
  static readonly type = '[Prefs] update prefs';
  constructor(public readonly payload: PrefsStateModel) { }
}

export interface PrefsStateModel {
  host: string;
  port: number;
  model: string;
  numCols: number;
  numRows: number;
  color: string;
  submitted?: boolean;
}

@State<PrefsStateModel>({
  name: 'prefs',
  defaults: {
    host: null,
    port: null,
    model: 'IBM-3278-4-E',
    numCols: 80,
    numRows: 43,
    color: 'green'
  }
}) export class PrefsState {

  @Action(UpdatePrefs)
  updatePrefs({ getState, setState }: StateContext<PrefsStateModel>,
              { payload }: UpdatePrefs) {
    // deduce row, cols from model
    let numCols = 0;
    let numRows = 0;
    switch (payload.model) {
      case 'IBM-3278-1-E':
        numCols = 80;
        numRows = 12;
        break;
      case 'IBM-3278-2-E':
        numCols = 80;
        numRows = 24;
        break;
      case 'IBM-3278-3-E':
        numCols = 80;
        numRows = 32;
        break;
      case 'IBM-3278-4-E':
        numCols = 80;
        numRows = 43;
        break;
      case 'IBM-3278-5-E':
        numCols = 132;
        numRows = 27;
        break;
    }
    setState({ ...getState(), ...payload, numCols, numRows });
  }

}
