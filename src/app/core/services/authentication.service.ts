import 'rxjs/add/operator/toPromise';
import { Inject, Injectable }                 from '@angular/core';
import { HttpClient }                         from '@angular/common/http';
import { APP_CONFIG, AppConfig }              from '../../app.config';
import { StatusActions }                      from '../../shared/state/status/status.actions';
import { Store }                              from '@ngrx/store';
import { AppState }                           from '../../shared/state/appState';
import { DatabaseService }                    from './database/database.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
    private store: Store<AppState>,
    private statusActions: StatusActions,
    private dBService: DatabaseService,
  ) { }

  signIn(authUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signin', JSON.stringify(authUser), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => console.log('signIn successful'))
      .catch(this.handleError);
  }

  signUp(newUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signup', JSON.stringify(newUser), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => console.log('verification email has been sent'))
      .catch(this.handleError);
  }

  forgotPassword(UserEmail): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/recover-account', JSON.stringify(UserEmail), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => console.log('reset password request has been sent'))
      .catch(this.handleError);
  }

  resetPassword(passwordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/auth/reset-password', JSON.stringify(passwordForm), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => console.log('successfully changed the password'))
      .catch(this.handleError);
  }

  changePassword(passwordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/user/change-password', JSON.stringify(passwordForm), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => console.log('successfully changed the password'))
      .catch(this.handleError);
  }

  signOut(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/auth/signout', {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then((response) => {
        this.dBService
          .removeAll('activeUser')
          .then(() => {
            this.store.dispatch(this.statusActions.loadStatus({netStatus: true, isLogin: false, stateChanged: false}));
          });
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
