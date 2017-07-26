import {Component, Inject, Input, OnInit} from '@angular/core';
import {User}                     from '../../../shared/state/user/user.model';
import {APP_CONFIG}               from '../../../app.config';
import {UserService}       from '../../user.service';
import * as _ from 'lodash';
import {Store} from '@ngrx/store';
import {AppState} from '../../../shared/state/appState';
import {UserActions} from '../../../shared/state/user/user.actions';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
})
export class UserProfileComponent implements OnInit {
  @Input() user: User;
  userEdit: User;
  userNameEdited: boolean;

  constructor (@Inject(APP_CONFIG) private config,
               private store: Store<AppState>,
               private userActions: UserActions,
               private UserService: UserService) {}

  ngOnInit(){
    this.userEdit = _.cloneDeep(this.user);
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
}
