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
  haveResponOfSubmit = false;

  constructor(
    private authService: AuthenticationService,
  ) {}

  signUp() {
    if (!this.submitted) {
      this.submitted = true;
      this.errorMessage = null;
      if (this.validation(this.newUser)) {
        this.newUser.email = this.newUser.email.toLowerCase();
        this.authService.signUp(this.newUser)
          .then(() => {
            this.haveResponOfSubmit = true;
            this.submitted = false;
          })
          .catch(error => {
            this.submitted = false;
            if (error.status === 400) {
              if (JSON.parse(error.error).errorCode === 3) {
                this.errorMessage = 'User already exists';
              } else {
                this.errorMessage = 'Email or password mismatch';
              }
            } else {
              this.errorMessage = 'Server communication error';
            }
          });
      } else {
        this.submitted = false;
      }
    }
  };

  validation(newUser): boolean {
    if (!EMAIL_REGEX.test(newUser.email)) {
      this.errorMessage = 'please enter valid email address';
      return false;
    }
    if (!newUser.password
      || newUser.password.length < 6
      || newUser.password.length > 32) {
      this.errorMessage = 'please choose password with 6 to 32 characters ';
      return false;
    }
    return true;
  }
}
