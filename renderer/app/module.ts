import { RouterModule, Routes } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EL3270Component } from './pages/el3270';
import { LibModule } from 'ellib/lib/module';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

/**
 * el-3270 module definition
 */

const COMPONENTS = [
  EL3270Component
];

const MODULES = [
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  LibModule,
  NgxElectronModule,
  RouterModule
];

const ROUTES: Routes = [ ];

const SERVICES = [ ];

@NgModule({

  bootstrap: [EL3270Component],

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
