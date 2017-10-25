import {Component} from '@angular/core';
import {AuthenticationService} from '../../core/services/authentication.service';
import {Router} from '@angular/router';
import { Location } from '@angular/common';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.sass']
})

export class ForgotPasswordComponent {
  private errorMessage: string;
  private User = {email: null};
  private submitted = false;

  constructor(
    private authService: AuthenticationService,
    private location: Location
  ) {}

  resetRequest() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.validation(this.User)) {
      this.authService.forgotPassword(this.User)
        .catch(error => {
          this.submitted = false;
          console.log('error is: ', error);
          if (error.status === 400) {
            this.errorMessage = 'Email not found';
          } else {
            this.errorMessage = 'Server communication error';
          }
        });
    } else {
      this.submitted = false;
    }
  };
  goBack(): void {
    this.location.back();
  }
  validation(User): boolean {
    if (!EMAIL_REGEX.test(User.email)) {
      this.errorMessage = 'please enter valid email address';
      return false;
    }
    return true;
  }
}
