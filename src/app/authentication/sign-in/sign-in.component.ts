import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {Router} from '@angular/router';

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
  ) {}

  signIn() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.validation(this.authUser)) {
      this.authService.signIn(this.authUser)
        .then(() => this.router.navigate(['dashboard']))
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
      this.errorMessage = '';
      return false;
    }
    if (!authUser.password
      || authUser.password.length < 6
      || authUser.password.length > 12) {
      this.errorMessage = '';
      return false;
    }
    return true;
  }
}
