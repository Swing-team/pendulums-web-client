import { Inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import { User } from '../../shared/state/user/user.model';
import {APP_CONFIG, AppConfig} from '../../app.config';

@Injectable()
export class UserService {
  private options;
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

  getSummary(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/user/summary', this.config.httpOptions)
      .toPromise()
      .then(response => (response as any).user as User)
      .catch(this.handleError);
  }

  update(user): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/user' , user, this.config.httpOptions)
      .toPromise()
      .then(response => (response as any).user as User)
      .catch(this.handleError);
  }

  updateSettings(settings): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/user/settings', JSON.stringify(settings), this.options)
      .toPromise()
      .then()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
