import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class AuthenticationService {
  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

  signIn(authUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signin', JSON.stringify(authUser), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('signIn successful'))
      .catch(this.handleError);
  }

  signUp(newUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signup', JSON.stringify(newUser), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('verification email has been sent'))
      .catch(this.handleError);
  }

  forgotPassword(UserEmail): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/recover-account', JSON.stringify(UserEmail), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('reset password request has been sent'))
      .catch(this.handleError);
  }

  resetPassword(passwordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/auth/reset-password', JSON.stringify(passwordForm), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('successfully changed the password'))
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
