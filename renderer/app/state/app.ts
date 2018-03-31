import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';
import { ScreenState, ScreenStateModel } from './screen';
import { StatusState, StatusStateModel } from './status';

export interface AppState {
  layout: LayoutStateModel;
  prefs: PrefsStateModel;
  screen: ScreenStateModel;
  status: StatusStateModel;
}

export const states = [
  LayoutState,
  PrefsState,
  ScreenState,
  StatusState
];
