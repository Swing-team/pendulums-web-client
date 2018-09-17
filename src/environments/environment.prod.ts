import { AppConfig } from 'app/app.config';

export const environment: AppConfig = {
  // angular specific
  production: true,

  // app configs
  socketEndpoint: 'https://app.pendulums.io',
  socketPath: '/api/socket.io',
  apiEndpoint: 'https://app.pendulums.io/api',
  httpOptions: { responseType: 'json' },
  imagesEndpoint: 'https://app.pendulums.io/api/images',
};
