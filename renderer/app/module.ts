import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';
import { RouterModule, Routes } from '@angular/router';

import { BarrelModule } from './barrel';
import { HelpPageComponent } from './pages/help/page';
import { HelpPageModule } from './pages/help/module';
import { LU3270PageComponent } from './pages/lu3270/page';
import { LU3270PageModule } from './pages/lu3270/module';
import { LU3270Service } from './services/lu3270';
import { NgModule } from '@angular/core';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { RootPageComponent } from './pages/root/page';
import { RootPageModule } from './pages/root/module';
import { states } from './state/app';

/**
 * el-3270 module definition
 */

const COMPONENTS = [ ];

const MODULES = [
  BarrelModule,
  HelpPageModule,
  RootPageModule,
  LU3270PageModule
];

const ROUTES: Routes = [
  {path: '',       component: HelpPageComponent},
  {path: 'help',   component: HelpPageComponent},
  {path: 'lu3270', component: LU3270PageComponent},
  {path: '**',     component: HelpPageComponent}
];

const SERVICES = [
  LU3270Service
];

@NgModule({

  bootstrap: [RootPageComponent],

  declarations: [
    ...COMPONENTS
  ],

  imports: [
    ...MODULES,
    NgxsModule.forRoot(states),
    NgxsLoggerPluginModule.forRoot({
      collapsed: true,
      logger: console
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['prefs', 'layout', 'window'],
      storage: StorageOption.LocalStorage
    }),
    RouterModule.forRoot(ROUTES)
  ],

  providers: [
    ...SERVICES
  ]

})

export class EL3270Module { }
