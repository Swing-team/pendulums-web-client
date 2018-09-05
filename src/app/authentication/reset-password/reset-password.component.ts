import { Component, OnDestroy, OnInit }         from '@angular/core';
import { AuthenticationService }                from '../../core/services/authentication.service';
import { ActivatedRoute, Router }               from '@angular/router';
import { Subscription }                         from 'rxjs/Subscription';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.sass']
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
  User = {password: null, token: null};
  rePassword: string;
  submitted = false;
  errorMessage: string;
  private subscriptions: Array<Subscription> = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.User.token = params['token']; }));
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  resetPassword() {
    if (!this.submitted) {
      this.submitted = true;
      this.errorMessage = null;
      if (this.validation(this.User)) {
        this.authService.resetPassword(this.User)
          .then(() => {
            this.submitted = false;
            this.router.navigate(['signIn'])
        })
          .catch(error => {
            this.submitted = false;
            console.log('error is: ', error);
            if (error.status === 404) {
              this.errorMessage = 'Your information not found';
            } else if (error.status === 400) {
              this.errorMessage = 'Bad request.';
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

  validation(User): boolean {
    if (!User.password
      || User.password.length < 6
      || User.password.length > 32) {
      this.errorMessage = 'please choose password with 6 to 32 characters ';
      return false;
    }
    if (User.password !== this.rePassword) {
      this.errorMessage = 'passwords mismatched ';
      return false;
    }
    return true;
  }
}
