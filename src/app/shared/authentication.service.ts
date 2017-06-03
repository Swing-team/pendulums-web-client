import { Inject, Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class AuthenticationService {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(
    private http: Http, @Inject(APP_CONFIG) private config) { }

  signIn(authUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signin', JSON.stringify(authUser),{withCredentials: true})
      .toPromise()
      .then(() => console.log('login successful'))
      .catch(this.handleError);
  }

  signOut(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/auth/signout', {headers: this.headers})
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
