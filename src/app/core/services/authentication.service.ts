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
  private options;
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
    private store: Store<AppState>,
    private statusActions: StatusActions,
    private dBService: DatabaseService,
  ) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

  signIn(captchaResponse, authUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signin?g-recaptcha-response=' + captchaResponse,
      JSON.stringify(authUser), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  signUp(newUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/signup', JSON.stringify(newUser), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  forgotPassword(UserEmail): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/auth/recover-account', JSON.stringify(UserEmail), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  resetPassword(passwordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/auth/reset-password', JSON.stringify(passwordForm), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  changePassword(passwordForm): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/user/change-password', JSON.stringify(passwordForm), this.options)
      .toPromise()
      .then(() => {})
      .catch(this.handleError);
  }

  signOut(): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/auth/signout', this.options)
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
