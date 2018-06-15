import { BarrelModule } from '../../barrel';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library as fontAwesome } from '@fortawesome/fontawesome-svg-core';
import { NgModule } from '@angular/core';
import { PrefsComponent } from './prefs';
import { RootCtrlComponent } from './ctrl';
import { RootPageComponent } from './page';
import { ToolbarComponent } from './toolbar';

fontAwesome.add(fab, far, fas);

/**
 * Root page module
 */

const COMPONENTS = [
  PrefsComponent,
  RootCtrlComponent,
  RootPageComponent,
  ToolbarComponent
];

const MODULES = [
  BarrelModule
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    RootPageComponent
  ],

  imports: [
    ...MODULES
  ]

})

export class RootPageModule { }
