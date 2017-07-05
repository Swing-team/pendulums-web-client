import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG = {
  apiEndpoint: 'http://localhost:1337',
  // imagesEndpoint: 'http://websiteIp/images',
  imagesEndpoint: 'http://websiteUrl/api/images',
};
