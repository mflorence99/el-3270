import { LayoutState } from './layout';
import { LayoutStateModel } from './layout';
import { PrefsState } from './prefs';
import { PrefsStateModel } from './prefs';
import { ScreenState } from './screen';
import { ScreenStateModel } from './screen';
import { StatusState } from './status';
import { StatusStateModel } from './status';
import { WindowState } from './window';
import { WindowStateModel } from './window';

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
