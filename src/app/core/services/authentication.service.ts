import { Injectable }                         from '@angular/core';
import { HttpClient }                         from '@angular/common/http';
import { environment }                        from '../../../environments/environment';
import { StatusActions }                      from '../../shared/state/status/status.actions';
import { Store }                              from '@ngrx/store';
import { AppState }                           from '../../shared/state/appState';
import { DatabaseService }                    from './database/database.service';

@Injectable()
export class AuthenticationService {
  private options;
  constructor(
    private http: HttpClient,
    private store: Store<AppState>,
    private statusActions: StatusActions,
    private dBService: DatabaseService,
  ) {
    this.options = {...environment.httpOptions, responseType: 'text'};
  }

  signIn(authUser): Promise<any> {
    return this.http
      .post(environment.apiEndpoint + '/auth/signin', JSON.stringify(authUser), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  signUp(newUser): Promise<any> {
    return this.http
      .post(environment.apiEndpoint + '/auth/signup', JSON.stringify(newUser), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  forgotPassword(UserEmail): Promise<any> {
    return this.http
      .post(environment.apiEndpoint + '/auth/recover-account', JSON.stringify(UserEmail), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  resetPassword(passwordForm): Promise<any> {
    return this.http
      .put(environment.apiEndpoint + '/auth/reset-password', JSON.stringify(passwordForm), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  changePassword(passwordForm): Promise<any> {
    return this.http
      .put(environment.apiEndpoint + '/user/change-password', JSON.stringify(passwordForm), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  signOut(): Promise<any> {
    return this.http
      .get(environment.apiEndpoint + '/auth/signout', this.options)
      .toPromise()
      .then((response) => {
        this.dBService
          .removeAll('activeUser')
          .then(() => {
            this.store.dispatch(this.statusActions.updateStatus({netStatus: true, isLogin: false}));
          });
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
