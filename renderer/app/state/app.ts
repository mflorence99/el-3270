import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';

export interface AppState {
  layout: LayoutStateModel;
  prefs: PrefsStateModel;
}

export const states = [
  LayoutState,
  PrefsState
];
