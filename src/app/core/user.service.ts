import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User } from '../shared/state/user/user.model';
import { APP_CONFIG } from '../app.config';

@Injectable()
export class UserService {
  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

  getSummary(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/user/summary', this.config.httpOptions)
      .toPromise()
      .then(response => response.json().user as User)
      .catch(this.handleError);
  }

  update(user): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/user' , user,{withCredentials: true})
      .toPromise()
      .then(response => response.json().user as User)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
