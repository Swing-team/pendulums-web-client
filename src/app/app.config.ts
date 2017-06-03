import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG = {
  // apiEndpoint: 'http://websiteUrl/api',
  // imagesEndpoint: 'http://websiteIp/images',
  imagesEndpoint: 'http://websiteUrl/api/images',
};
