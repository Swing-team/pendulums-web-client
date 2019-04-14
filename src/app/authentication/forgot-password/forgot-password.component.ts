import { Component }                  from '@angular/core';
import { AuthenticationService }      from '../../core/services/authentication.service';
import { Location }                   from '@angular/common';
import { Router }                     from '@angular/router';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.sass']
})

export class ForgotPasswordComponent {
  private errorMessage: string;
  private User = {email: null};
  submitted = false;
  haveResponseOfSubmit = false;

  constructor(
    private authService: AuthenticationService,
    private location: Location,
    private router: Router
  ) {}

  resetRequest() {
    if (!this.submitted) {
      this.submitted = true;
      this.errorMessage = null;
      if (this.validation(this.User)) {
        this.User.email = this.User.email.toLowerCase();
        this.authService.forgotPassword(this.User).then(() => {
          this.submitted = false;
          this.haveResponseOfSubmit = true;
        })
          .catch(error => {
            this.submitted = false;
            console.log('error is: ', error);
            if (error.status === 400) {
              this.errorMessage = 'Bad request';
            } else if (error.status === 404) {
              this.errorMessage = 'Email not found';
            } else if (error.status === 503) {
              this.errorMessage = 'You have reached the authentication limits, please try in a few minutes!';
            } else {
              this.errorMessage = 'Server communication error';
            }
          });
      } else {
        this.submitted = false;
      }
    }
  };

  goBack(): void {
    this.location.back();
  }

  validation(User): boolean {
    if (!EMAIL_REGEX.test(User.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    return true;
  }

  redirectToSignIn() {
    this.router.navigate(['signIn']);
  }
}
