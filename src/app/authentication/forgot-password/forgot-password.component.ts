import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {Router} from '@angular/router';
import { Location } from '@angular/common';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.sass']
})

export class ForgotPasswordComponent {
  private authUser = {email: null, password: null};
  private submitted = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private location: Location
  ) {}

  ressetRequest() {
    this.submitted = true;
  };

  goBack(): void {
    this.location.back();
  }
}
