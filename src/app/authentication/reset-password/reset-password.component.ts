import { Component, OnInit }        from '@angular/core';
import { AuthenticationService }    from '../../core/services/authentication.service';
import { ActivatedRoute, Router }   from '@angular/router';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.sass']
})

export class ResetPasswordComponent implements OnInit {
  User = {password: null, token: null};
  rePassword: string;
  submitted = false;
  errorMessage: string;
  private sub: any;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.User.token = params['token']; });
  }

  resetPassword() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.validation(this.User)) {
      this.authService.resetPassword(this.User)
        .then(() => this.router.navigate(['signIn']))
        .catch(error => {
          this.submitted = false;
          console.log('error is: ', error);
          if (error.status === 400) {
            this.errorMessage = 'your information not found';
          } else {
            this.errorMessage = 'Server communication error';
          }
        });
    } else {
      this.submitted = false;
    }
  };

  validation(User): boolean {
    if (!User.password
      || User.password.length < 6
      || User.password.length > 12) {
      this.errorMessage = 'please choose password with 6 to 12 characters ';
      return false;
    }
    if (User.password !== this.rePassword) {
      this.errorMessage = 'passwords mismatched ';
      return false;
    }
    return true;
  }
}
