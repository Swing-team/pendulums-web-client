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

  // ngrx runtime check
  ngrxRuntimeCheck: {
    strictStateSerializability: false,
    strictActionSerializability: false,
    strictStateImmutability: false,
    strictActionImmutability: false,
    strictActionWithinNgZone: false,
    strictActionTypeUniqueness: false,
  },
};
