import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { MobileAppModule } from './app/app.mobile.module';
import { environment } from './environments/environment';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

function isCordovaLoaded() {
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length; i--;) {
      if (scripts[i].src === 'cordova.js') {
        return true;
      }
  }
  return false;
}

if (!isCordovaLoaded()) {
  const script = document.createElement('script');
  script.src = 'cordova.js';
  document.body.appendChild(script);
}

platformBrowserDynamic().bootstrapModule(MobileAppModule)
  .catch(err => console.log(err));
