import { BarrelModule } from '../../barrel';
import { NgModule } from '@angular/core';
import { ScreenPageComponent } from './page';

/**
 * Noop page module
 */

const COMPONENTS = [
  ScreenPageComponent
];

const MODULES = [
  BarrelModule
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    ScreenPageComponent
  ],

  imports: [
    ...MODULES
  ]

})

export class ScreenPageModule { }
