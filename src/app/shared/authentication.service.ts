import { Inject, Injectable } from '@angular/core';
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
      .post(this.config.apiEndpoint + '/auth/signin', JSON.stringify(authUser), {withCredentials: true})
      .toPromise()
      .then(() => console.log('signIn successful'))
      .catch(this.handleError);
  }
  signUp(newUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signup', JSON.stringify(newUser), {withCredentials: true})
      .toPromise()
      .then(() => console.log('signup request email has been sent'))
      .catch(this.handleError);
  }
  forgotPassword(UserEmail): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/recover-account', JSON.stringify(UserEmail), {withCredentials: true})
      .toPromise()
      .then(() => console.log('password reset request has been sent'))
      .catch(this.handleError);
  }
  resetPassword(paswordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/auth/reset-password', JSON.stringify(paswordForm), {withCredentials: true})
      .toPromise()
      .then(() => console.log('password has been sent'))
      .catch(this.handleError);
  }
  signOut(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/auth/signout', {withCredentials: true})
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
