import { BrowserModule } from '@angular/platform-browser';
import { EL3270Component } from './pages/el3270';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

@NgModule({

  bootstrap: [EL3270Component],

  declarations: [
    EL3270Component
  ],

  imports: [
    BrowserModule,
    NgxElectronModule
  ],

  providers: []

})

export class EL3270Module { }
