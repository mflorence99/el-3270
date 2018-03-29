import { BarrelModule } from '../../barrel';
import { NgModule } from '@angular/core';
import { PrefsComponent } from './prefs';
import { RootCtrlComponent } from './ctrl';
import { RootPageComponent } from './page';
import { ToolbarComponent } from './toolbar';

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
