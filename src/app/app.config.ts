import {InjectionToken, NgModule} from '@angular/core';

export let APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export class AppConfig {
  socketEndpoint: string;
  apiEndpoint: string;
  httpOptions: Object;
  // imagesEndpoint: string;
  imagesEndpoint: string;
}

export const APP_DI_CONFIG: AppConfig = {
  socketEndpoint: 'http://localhost:1337',
  apiEndpoint: 'http://localhost:1337',
  httpOptions: { withCredentials: true, responseType: 'json' },
  // imagesEndpoint: 'http://websiteIp/images',
  imagesEndpoint: 'http://localhost:1337/images',
};

@NgModule({
  providers: [{
    provide: APP_CONFIG,
    useValue: APP_DI_CONFIG
  }]
})
export class AppConfigModule { }
