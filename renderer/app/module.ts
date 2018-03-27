import { RouterModule, Routes } from '@angular/router';

import { BarrelModule } from './barrel';
import { HelpPageComponent } from './pages/help/page';
import { HelpPageModule } from './pages/help/module';
import { NgModule } from '@angular/core';
import { RootPageComponent } from './pages/root/page';
import { RootPageModule } from './pages/root/module';
import { ScreenPageComponent } from './pages/screen/page';
import { ScreenPageModule } from './pages/screen/module';

/**
 * el-3270 module definition
 */

const COMPONENTS = [ ];

const MODULES = [
  BarrelModule,
  HelpPageModule,
  RootPageModule,
  ScreenPageModule
];

const ROUTES: Routes = [
  {path: '',       component: HelpPageComponent},
  {path: 'help',   component: HelpPageComponent},
  {path: 'screen', component: ScreenPageComponent},
  {path: '**',     component: HelpPageComponent}
];

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
