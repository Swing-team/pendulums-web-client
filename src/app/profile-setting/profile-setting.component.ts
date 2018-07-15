import * as _ from 'lodash';
import {
  Component, Inject, OnDestroy, OnInit
}                                           from '@angular/core';
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
import { Subscription }                     from 'rxjs/Subscription';


@Component({
  selector: 'profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.sass'],
})

export class ProfileSettingComponent implements OnInit, OnDestroy {
  rePassword: string;
  submitted = false;
  data = {newPassword: null, oldPassword: null};
  user: User;
  userEdit: User;
  emailHash: any;
  userNameEdited: boolean;
  netConnected: boolean;
  editButtonDisabled = false;
  private status: Observable<any>;
  private subscriptions: Array<Subscription> = [];

  constructor (@Inject(APP_CONFIG) private config,
               private authService: AuthenticationService,
               private errorService: ErrorService,
               private store: Store<AppState>,
               private userActions: UserActions,
               private userService: UserService,
               private modalService: ModalService) {
    this.subscriptions.push(store.select('user').subscribe((user: User) => {
      this.user = user;
      this.userEdit = _.cloneDeep(user);
      if (user.email) {
        this.emailHash = Md5.hashStr(user.email);
      }
    }));
    this.status = store.select('status');
  }

  ngOnInit(): void {
    // To handle connection status
    this.subscriptions.push(this.status.subscribe((state) => {
      if (!state.netStatus) {
        this.netConnected = false;
      }
      if (state.netStatus) {
        this.netConnected = true;
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  toggleView() {
    if (this.netConnected) {
      this.userNameEdited = !this.userNameEdited;
      if (!this.userNameEdited) {
        this.userEdit.name = this.user.name;
      }
    } else {
      this.showError('This feature is not available in offline mode');
    }
  }

  saveProfile() {
    if (!this.editButtonDisabled ) {
      if (this.userEdit.name !== this.user.name) {
        this.editButtonDisabled = true;
        const formData = new FormData();
        formData.append('user', JSON.stringify({name: this.userEdit.name}));
        this.userService.update(formData).then((user) => {
          this.store.dispatch(this.userActions.updateUserName(user.name));
          this.editButtonDisabled = false;
          this.userNameEdited = false;
        })
          .catch(error => {
            this.editButtonDisabled = false;
            console.log('error is: ', error);
            this.userNameEdited = false;
          });
      }
    }
  }

  openImageModal() {
    if (this.netConnected) {
      this.modalService.show({
        component: ImgCropperComponent,
        inputs: {
          initialImage: this.userEdit.profileImage ? this.config.imagesEndpoint
          + '/profile/' + this.userEdit.profileImage :
          '../../../assets/images/placeholder.png'
        },
        customStyles: {'width': '350px', 'overflow': 'initial'}
      });
    } else {
      this.showError('This feature is not available in offline mode');
    }
  }

  resetPassword() {
    if (this.netConnected) {
      this.submitted = true;
      if (this.validationPassword(this.data)) {
        this.authService.changePassword(this.data)
          .then(() => {
            this.submitted = false;
            this.showError('The password changed successfully');
          })
          .catch(error => {
            this.submitted = false;
            console.log('error is: ', error);
            this.showError('Server communication error');
          });
      } else {
        this.submitted = false;
      }
    } else {
      this.showError('This feature is not available in offline mode');
    }
  };

  validationPassword(User): boolean {
    if (!User.newPassword
      || User.newPassword.length < 6
      || User.newPassword.length > 32) {
      this.showError('Password length must be between 6 and 32 characters');
      return false;
    }
    if (User.newPassword !== this.rePassword) {
      this.showError('Passwords mismatched');
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
