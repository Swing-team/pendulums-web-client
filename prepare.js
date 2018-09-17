const { version } = require('./package.json');
const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');

const versionFile = resolve(__dirname, 'src', 'environments', 'version.ts');
writeFileSync(versionFile,
`// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION = "${version}";
/* tslint:enable */
`, { encoding: 'utf-8' });

console.log(`Wrote version info to ${relative(resolve(__dirname, '..'), versionFile)}`);

// --------------------------------------------------------------------------------------

const configFile = resolve(__dirname, 'src', 'environments', 'local.config.ts');
writeFileSync(configFile,
`import { AppConfig } from 'app/app.config';

export const localConfig: AppConfig = {
  // angular specific
  production: false,

  // app configs
  socketEndpoint: 'http://localhost:1337',
  socketPath: '/socket.io',
  apiEndpoint: 'http://localhost:1337',
  httpOptions: { withCredentials: true, responseType: 'json' },
  imagesEndpoint: 'http://localhost:1337/images',
};

`, { encoding: 'utf-8' });

console.log(`Wrote config to ${relative(resolve(__dirname, '..'), configFile)}`);
