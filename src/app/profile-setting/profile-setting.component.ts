import * as _ from 'lodash';
import {
  Component, OnDestroy, OnInit
}                                           from '@angular/core';
import { environment }                       from '../../environments/environment';
import { AuthenticationService }            from '../core/services/authentication.service';
import { ErrorService }                     from '../core/error/error.service';
import { User, Settings }                   from '../shared/state/user/user.model';
import { Store }                            from '@ngrx/store';
import { AppState }                         from '../shared/state/appState';
import { UserActions }                      from '../shared/state/user/user.actions';
import { UserService }                      from '../core/services/user.service';
import { ModalService }                     from '../core/modal/modal.service';
import { ImgCropperComponent }              from './image-cropper/image-cropper.component';
import { Md5 }                              from 'ts-md5/dist/md5';
import { Observable }                       from 'rxjs/Observable';
import { Subscription }                     from 'rxjs/Subscription';
import { NativeNotificationService }        from '../core/services/native-notification.service';
import { Location }                         from '@angular/common';

@Component({
  selector: 'profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.sass'],
})

export class ProfileSettingComponent implements OnInit, OnDestroy {
  environment = environment;
  rePassword: string;
  submitted = false;
  settingsSubmitted = false;
  data = {newPassword: null, oldPassword: null};
  user: User;
  userEdit: User;
  emailHash: any;
  userNameEdited: boolean;
  netConnected: boolean;
  settings: Settings;
  relaxationTimeSelectorModel: any;
  workingTimeInputModel: string;
  relaxTimeInputModel: string;
  editButtonDisabled = false;
  private status: Observable<any>;
  private subscriptions: Array<Subscription> = [];

  constructor (private authService: AuthenticationService,
               private errorService: ErrorService,
               private store: Store<AppState>,
               private userActions: UserActions,
               private userService: UserService,
               private location: Location,
               private modalService: ModalService,
               private nativeNotificationService: NativeNotificationService) {
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

    this.subscriptions.push(this.store.select('user').subscribe((user: User) => {
      this.user = user;
      this.userEdit = _.cloneDeep(user);
      this.settings = _.cloneDeep(user.settings);
      if (user.email) {
        this.emailHash = Md5.hashStr(user.email);
      }

      if (this.settings.relaxationTime.isEnabled) {
        const workingTime = this.settings.relaxationTime.workingTime;
        const restTime = this.settings.relaxationTime.restTime;
        if (workingTime === 3000000 && restTime === 900000) {
          this.relaxationTimeSelectorModel = 'pomodoro1';
          this.workingTimeInputModel = (workingTime / 60000).toString();
          this.relaxTimeInputModel = (restTime / 60000).toString();
        } else if (workingTime === 1800000 && restTime === 600000) {
          this.relaxationTimeSelectorModel = 'pomodoro2';
          this.workingTimeInputModel = (workingTime / 60000).toString();
          this.relaxTimeInputModel = (restTime / 60000).toString();
        } else if (workingTime === 1500000 && restTime === 420000) {
          this.relaxationTimeSelectorModel = 'pomodoro3';
          this.workingTimeInputModel = (workingTime / 60000).toString();
          this.relaxTimeInputModel = (restTime / 60000).toString();
        } else {
          this.relaxationTimeSelectorModel = 'pomodoroCustom';
          this.workingTimeInputModel = (this.settings.relaxationTime.workingTime / 60000).toString();
          this.relaxTimeInputModel = (this.settings.relaxationTime.restTime / 60000).toString();
        }
      } else {
        this.relaxationTimeSelectorModel = 'pomodoro1';
          this.workingTimeInputModel = '50';
          this.relaxTimeInputModel = '15';
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
      this.showError('Not available in offline mode');
    }
  }

  goBack() {
    this.location.back();
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
          initialImage: this.userEdit.profileImage ? environment.imagesEndpoint
          + '/profile/' + this.userEdit.profileImage :
          'assets/images/placeholder.png'
        },
        customStyles: {'width': '350px', 'overflow': 'initial'}
      });
    } else {
      this.showError('Not available in offline mode');
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
            if (error.status === 503) {
              this.showError('You have reached the authentication limits, please try in a few minutes!');
            } else {
              this.showError('Server communication error');
            }
          });
      } else {
        this.submitted = false;
      }
    } else {
      this.showError('Not available in offline mode');
    }
  };

  updateSettings() {
    this.settingsSubmitted = true;
    if (this.settings.relaxationTime.isEnabled) {
      this.nativeNotificationService.getPermission();
    }
    if (this.relaxationTimeSelectorModel === 'pomodoroCustom') {
      if (!this.workingTimeInputModel || !this.relaxTimeInputModel) {
        this.settings.relaxationTime.workingTime = 0;
        this.settings.relaxationTime.restTime = 0;
        this.showError('Please fill the rest time fields');
        this.settingsSubmitted = false;
      } else {
        this.settings.relaxationTime.workingTime = (Number(this.workingTimeInputModel) * 60 * 1000);
        this.settings.relaxationTime.restTime = (Number(this.relaxTimeInputModel) * 60 * 1000);
      }
    }
    if (this.settingsSubmitted) {
      this.userService.updateSettings(this.settings).then(() => {
        this.store.dispatch(this.userActions.updateUserSettings(this.settings));
        this.settingsSubmitted = false;
        this.showError('Saved successfully');
      }).catch(error => {
        this.settingsSubmitted = false;
        console.log('error is: ', error);
        this.showError('Server communication error');
      });
    }
  }

  timeSelectorChange() {
    if (this.relaxationTimeSelectorModel === 'pomodoro1') {
      this.workingTimeInputModel = '50';
      this.relaxTimeInputModel = '15';
      this.settings.relaxationTime.workingTime = (Number(this.workingTimeInputModel) * 60000);
      this.settings.relaxationTime.restTime = (Number(this.relaxTimeInputModel) * 60000);
    } else if (this.relaxationTimeSelectorModel === 'pomodoro2') {
      this.workingTimeInputModel = '30';
      this.relaxTimeInputModel = '10';
      this.settings.relaxationTime.workingTime = (Number(this.workingTimeInputModel) * 60000);
      this.settings.relaxationTime.restTime = (Number(this.relaxTimeInputModel) * 60000);
    } else if (this.relaxationTimeSelectorModel === 'pomodoro3') {
      this.workingTimeInputModel = '25';
      this.relaxTimeInputModel = '7';
      this.settings.relaxationTime.workingTime = (Number(this.workingTimeInputModel) * 60000);
      this.settings.relaxationTime.restTime = (Number(this.relaxTimeInputModel) * 60000);
    } else if (this.relaxationTimeSelectorModel === 'pomodoroCustom') {
      this.workingTimeInputModel = '';
      this.relaxTimeInputModel = '';
      this.settings.relaxationTime.workingTime = 0;
      this.settings.relaxationTime.restTime = 0;
    }
  }

  changeDropDown() {
    const workingTime = Number(this.workingTimeInputModel) * 60000;
    const restTime = Number(this.relaxTimeInputModel) * 60000;
    if (workingTime === 3000000 && restTime === 900000) {
      this.relaxationTimeSelectorModel = 'pomodoro1';
    } else if (workingTime === 1800000 && restTime === 600000) {
      this.relaxationTimeSelectorModel = 'pomodoro2';
    } else if (workingTime === 1500000 && restTime === 420000) {
      this.relaxationTimeSelectorModel = 'pomodoro3';
    } else {
      this.relaxationTimeSelectorModel = 'pomodoroCustom';
    }
  }

  validationPassword(User): boolean {
    if (!User.newPassword
      || User.newPassword.length < 6
      || User.newPassword.length > 32) {
      this.showError('The password length must be between 6 and 32 characters');
      return false;
    }
    if (User.newPassword !== this.rePassword) {
      this.showError('Passwords mismatched');
      return false;
    }
    return true;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
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
