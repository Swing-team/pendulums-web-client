import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {Router} from '@angular/router';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.sass']
})

export class ResetPasswordComponent {
  private authUser = {email: null, password: null};
  private submitted = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  ressetPassword() {
    this.submitted = true;
  };
}
