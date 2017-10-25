import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG = {
  socketEndpoint: 'http://localhost:1337',
  apiEndpoint: 'http://localhost:1337',
  httpOptions: { withCredentials: true },
  // imagesEndpoint: 'http://websiteIp/images',
  imagesEndpoint: 'http://localhost:1337/images',
};
