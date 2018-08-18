import { Inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG, AppConfig} from '../../app.config';
import { VERSION } from 'environments/version';

@Injectable()
export class AppService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) { }

  getAppVersion(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/app/version', this.config.httpOptions)
      .toPromise()
      .then((response: any) => {
        if (VERSION < response.appVersion) {
          return true;
        }
        return false;
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
