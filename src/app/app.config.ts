import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG = {
  // apiEndpoint: 'http://192.168.1.106:1337',
  apiEndpoint: 'http://gymcheadmin/api',
  // imagesEndpoint: 'http://192.168.1.106:1337/images',
  imagesEndpoint: 'http://gymcheadmin/api/images',
};
