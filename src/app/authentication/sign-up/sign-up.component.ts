import { Component }                from '@angular/core';
import { AuthenticationService }    from '../../core/services/authentication.service';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.sass']
})

export class SignUpComponent {
  errorMessage: string;
  private newUser = {email: null, password: null};
  submitted = false;

  constructor(
    private authService: AuthenticationService,
  ) {}

  signUp() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.validation(this.newUser)) {
      this.authService.signUp(this.newUser)
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
  validation(newUser): boolean {
    if (!EMAIL_REGEX.test(newUser.email)) {
      this.errorMessage = 'please enter valid email address';
      return false;
    }
    if (!newUser.password
      || newUser.password.length < 6
      || newUser.password.length > 12) {
      this.errorMessage = 'please choose password with 6 to 12 characters ';
      return false;
    }
    return true;
  }
}
