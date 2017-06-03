import { Inject, Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User } from './state/user/user.model';
import { APP_CONFIG } from '../app.config';

@Injectable()
export class UserService {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

  getSummary(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/user/summary', { withCredentials: true})
      .toPromise()
      .then(response => response.json().user as User)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
