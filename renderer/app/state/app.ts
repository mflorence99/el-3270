import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';
import { ScreenState, ScreenStateModel } from './screen';
import { StatusState, StatusStateModel } from './status';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  layout: LayoutStateModel;
  prefs: PrefsStateModel;
  screen: ScreenStateModel;
  status: StatusStateModel;
  window: WindowStateModel;
}

export const states = [
  LayoutState,
  PrefsState,
  ScreenState,
  StatusState,
  WindowState
];
