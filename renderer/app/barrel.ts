import { MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatInputModule, MatRadioModule, MatSlideToggleModule, MatTooltipModule } from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibModule } from 'ellib';
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
  FontAwesomeModule,
  LibModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatInputModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatTooltipModule,
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
