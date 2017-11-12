import * as _ from 'lodash';
import { Component, Inject,
         OnInit, ViewContainerRef }         from '@angular/core';
import { APP_CONFIG }                       from '../app.config';
import { AuthenticationService }            from '../core/services/authentication.service';
import { ErrorService }                     from '../core/error/error.service';
import { User }                             from '../shared/state/user/user.model';
import { Store }                            from '@ngrx/store';
import { AppState }                         from '../shared/state/appState';
import { UserActions }                      from '../shared/state/user/user.actions';
import { UserService }                      from '../core/services/user.service';
import { ModalService }                     from '../core/modal/modal.service';
import { ImgCropperComponent }              from './image-cropper/image-cropper.component';
import { Md5 }                              from 'ts-md5/dist/md5';
import { Observable }                       from 'rxjs/Observable';


@Component({
  selector: 'profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.sass'],
})

export class ProfileSettingComponent implements OnInit{
  private data = {newPassword: null, oldPassword: null};
  private rePassword: string;
  private submitted = false;

  user: User;
  userEdit: User;
  emailHash: any;
  userNameEdited: boolean;
  netConnected: boolean;
  private status: Observable<any>;

  constructor (@Inject(APP_CONFIG) private config,
               private authService: AuthenticationService,
               private errorService: ErrorService,
               private store: Store<AppState>,
               private userActions: UserActions,
               private UserService: UserService,
               private modalService: ModalService,
               private viewContainerRef: ViewContainerRef) {
    store.select('user').subscribe((user: User) => {
      this.user = user;
      this.userEdit = _.cloneDeep(user);
      if (user.email) {
        this.emailHash = Md5.hashStr(user.email);
      }
    });
    this.status = store.select('status');
  }

  ngOnInit(): void {
    // To handle connection status
    this.status.subscribe((state) => {
      if (!state.netStatus) {
        this.netConnected = false;
        this.showError('You cant change password in offline mod!');
      }
      if (state.netStatus) {
        this.netConnected = true;
      }
    });
  }

  toggleView() {
    this.userNameEdited = !this.userNameEdited;
  }

  saveProfile() {
    this.userNameEdited = false;
    if (this.userEdit.name !== this.user.name) {
      const formData = new FormData();
      formData.append('user', JSON.stringify({name: this.userEdit.name}));
      this.UserService.update(formData).then((user) => {
        this.store.dispatch(this.userActions.updateUserName(user.name));
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  openImageModal() {
    this.modalService.show({
      component: ImgCropperComponent,
      containerRef: this.viewContainerRef,
      customStyles: {'width': '350px', 'overflow': 'initial'}
    });
  }

  resetPassword() {
    this.submitted = true;
    if (this.validationPassword(this.data)) {
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

  validationPassword(User): boolean {
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
