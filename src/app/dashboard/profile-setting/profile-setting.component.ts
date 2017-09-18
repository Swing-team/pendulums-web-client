import { Component, Inject }                from '@angular/core';
import { Router }                           from '@angular/router';
import { APP_CONFIG }                       from '../../app.config';
import { AuthenticationService }            from '../../core/authentication.service';
import { ErrorService }                     from '../../core/error/error.service';

@Component({
  selector: 'profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.sass'],
})

export class ProfileSettingComponent {
  private data = {newPassword: null, oldPassword: null};
  private rePassword: string;
  private submitted = false;

  constructor (@Inject(APP_CONFIG) private config,
               private router: Router,
               private authService: AuthenticationService,
               private errorService: ErrorService) {}

  resetPassword() {
    this.submitted = true;
    if (this.validation(this.data)) {
      this.authService.changePassword(this.data)
        .then(() => {
          this.submitted = false;
          this.showError('password changed successfully');
        })
        .catch(error => {
          this.submitted = false;
          console.log('error is: ', error);
          if (error.status === 400) {
            this.showError('your information not found');
          } else {
            this.showError('Server communication error');
          }
        });
    } else {
      this.submitted = false;
    }
  };

  validation(User): boolean {
    if (!User.newPassword
      || User.newPassword.length < 6
      || User.newPassword.length > 12) {
      this.showError('please choose password with 6 to 12 characters');
      return false;
    }
    if (User.newPassword !== this.rePassword) {
      this.showError('passwords miss match');
      return false;
    }
    return true;
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
