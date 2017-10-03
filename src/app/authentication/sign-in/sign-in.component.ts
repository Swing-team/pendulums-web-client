import { Component }                        from '@angular/core';
import { AuthenticationService }            from '../../core/servises/authentication.service';
import { Router }                           from '@angular/router';
import { Store }                            from '@ngrx/store';
import { AppState }                         from '../../shared/state/appState';
import { StatusActions }                    from '../../shared/state/status/status.actions';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})

export class SignInComponent {
  private errorMessage: string;
  private authUser = {email: null, password: null};
  private submitted = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private statusActions: StatusActions,
    private store: Store<AppState>,
  ) {}

  signIn() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.validation(this.authUser)) {
      this.authService.signIn(this.authUser)
        .then(() => {
          this.store.dispatch(this.statusActions.updateIsLogin(true));
          this.router.navigate(['dashboard']);
        })
        .catch(error => {
          this.submitted = false;
          console.log('error is: ', error);
          if (error.status === 400) {
            this.errorMessage = 'Email or password miss match';
          } else {
            this.errorMessage = 'Server communication error';
          }
        });
    } else {
      this.submitted = false;
    }
  };

  validation(authUser): boolean {
    if (!EMAIL_REGEX.test(authUser.email)) {
      this.errorMessage = 'please enter valid email address';
      return false;
    }
    if (!authUser.password
      || authUser.password.length < 6
      || authUser.password.length > 12) {
      this.errorMessage = 'please choose password with 6 to 12 characters ';
      return false;
    }
    return true;
  }
}
