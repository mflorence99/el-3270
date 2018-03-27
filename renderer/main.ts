import 'hammerjs';
import 'numeral';
import 'marked';

import { EL3270Module } from './app/module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic().bootstrapModule(EL3270Module)
  .catch(err => console.log(err));
