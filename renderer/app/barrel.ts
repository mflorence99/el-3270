import { MatButtonModule, MatCheckboxModule, MatInputModule, MatRadioModule } from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { LibModule } from 'ellib/lib/module';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/**
 * A barrel of all the modules we use everywhere
 */

const MODULES = [
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  LibModule,
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatRadioModule,
  NgxElectronModule,
  ReactiveFormsModule,
  RouterModule
];

@NgModule({

  imports: [
    ...MODULES
  ],

  exports: [
    ...MODULES
  ],

})

export class BarrelModule { }
