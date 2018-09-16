import { Inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import {environment} from '../../../environments/environment';

@Injectable()
export class AppService {
  constructor(
    private http: HttpClient
  ) { }

  getAppVersion() {
    return this.http
      .get(environment.apiEndpoint + '/app/version', environment.httpOptions)
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
