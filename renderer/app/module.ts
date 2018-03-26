import { RouterModule, Routes } from '@angular/router';

import { BarrelModule } from './barrel';
import { NgModule } from '@angular/core';
import { RootPageComponent } from './pages/root/page';
import { RootPageModule } from './pages/root/module';

/**
 * el-3270 module definition
 */

const COMPONENTS [ ];

const MODULES = [
  BarrelModule,
  RootPageModule
];

const ROUTES: Routes = [ ];

const SERVICES = [ ];

@NgModule({

  bootstrap: [RootPageComponent],

  declarations: [
    ...COMPONENTS
  ],

  imports: [
    ...MODULES,
    RouterModule.forRoot(ROUTES)
  ],

  providers: [
    ...SERVICES
  ]

})

export class EL3270Module { }
