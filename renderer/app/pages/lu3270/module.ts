import { BarrelModule } from '../../barrel';
import { CellComponent } from './cell';
import { KeyComponent } from './key';
import { KeyboardComponent } from './keyboard';
import { LU3270PageComponent } from './page';
import { NgModule } from '@angular/core';
import { ScreenComponent } from './screen';
import { StatusbarComponent } from './statusbar';

/**
 * LU3270 page module
 */

const COMPONENTS = [
  CellComponent,
  KeyboardComponent,
  KeyComponent,
  LU3270PageComponent,
  ScreenComponent,
  StatusbarComponent
];

const MODULES = [
  BarrelModule
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    LU3270PageComponent
  ],

  imports: [
    ...MODULES
  ]

})

export class LU3270PageModule { }
