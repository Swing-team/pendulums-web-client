import {Component, Inject, Input, OnInit, ViewContainerRef} from '@angular/core';
import {User}                     from '../../../shared/state/user/user.model';
import {APP_CONFIG}               from '../../../app.config';
import {UserService}       from '../../user.service';
import * as _ from 'lodash';
import {Store} from '@ngrx/store';
import {AppState} from '../../../shared/state/appState';
import {UserActions} from '../../../shared/state/user/user.actions';
import {ImgCropperComponent} from './image-cropper/image-cropper.component';
import {ModalService} from '../../modal/modal.service';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
})
export class UserProfileComponent implements OnInit {
  @Input() user: User;
  userEdit: User;
  emailHash: any;
  userNameEdited: boolean;

  constructor (@Inject(APP_CONFIG) private config,
               private store: Store<AppState>,
               private userActions: UserActions,
               private UserService: UserService,
               private modalService: ModalService,
               private viewContainerRef: ViewContainerRef) {}

  ngOnInit(){
    this.userEdit = _.cloneDeep(this.user);
    this.emailHash = Md5.hashStr(this.user.email);
  }

  toggleTimer() {
    this.userNameEdited = !this.userNameEdited;
  }

  saveProfile() {
    this.userNameEdited = false;
    if (this.userEdit.name !== this.user.name) {
      const formData = new FormData();
      formData.append('user', JSON.stringify({name: this.userEdit.name}));
      this.UserService.update(formData).then((user) => {
        this.store.dispatch(this.userActions.loadUser(user));
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  openImageModal() {
    this.modalService.show({
      component: ImgCropperComponent,
      containerRef: this.viewContainerRef
    });
  }
}
