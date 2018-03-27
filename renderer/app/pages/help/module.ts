import { BarrelModule } from '../../barrel';
import { HelpPageComponent } from './page';
import { NgModule } from '@angular/core';

/**
 * Noop page module
 */

const COMPONENTS = [
  HelpPageComponent
];

const MODULES = [
  BarrelModule
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    HelpPageComponent
  ],

  imports: [
    ...MODULES
  ]

})

export class HelpPageModule { }
