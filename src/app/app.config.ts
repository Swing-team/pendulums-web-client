export interface AppConfig {
  // angular specific
  production: boolean;

  // app configs
  socketEndpoint: string;
  socketPath: string;
  apiEndpoint: string;
  httpOptions: Object;
  imagesEndpoint: string;

  // ngrx runtime check
  ngrxRuntimeCheck: Object;
}
