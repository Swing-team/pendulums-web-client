import {InjectionToken, NgModule} from '@angular/core';

export let APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export class AppConfig {
  socketEndpoint: string;
  socketPath: string;
  apiEndpoint: string;
  httpOptions: Object;
  imagesEndpoint: string;
}

export const APP_DI_CONFIG: AppConfig = {
  socketEndpoint: 'http://localhost:1337',
  // production
  // socketEndpoint: 'https://app.pendulums.io',
  socketPath: '/socket.io',
  // production
  // socketPath: '/api/socket.io',
  apiEndpoint: 'http://localhost:1337',
  // production
  // apiEndpoint: 'https://app.pendulums.io/api',
  httpOptions: { withCredentials: true, responseType: 'json' },
  // production
  // httpOptions: { responseType: 'json' },
  imagesEndpoint: 'http://localhost:1337/images',
  // production
  // imagesEndpoint: 'https://app.pendulums.io/api/images',
};

@NgModule({
  providers: [{
    provide: APP_CONFIG,
    useValue: APP_DI_CONFIG
  }]
})
export class AppConfigModule { }
