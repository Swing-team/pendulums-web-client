import { Inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG, AppConfig} from '../../app.config';

@Injectable()
export class AppService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) { }

  getAppVersion() {
    return this.http
      .get(this.config.apiEndpoint + '/app/version', this.config.httpOptions)
      .toPromise()
      .then((response: any) => {
        return response.appVersion;
      })
      .catch(this.handleError)
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
