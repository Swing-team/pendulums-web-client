import { Component, Input }                       from '@angular/core';
import { ModalService }                           from '../../core/modal/modal.service';
import { UserActions }                            from '../../shared/state/user/user.actions';
import { UserService }                            from '../../core/services/user.service';
import { User }                                   from 'app/shared/state/user/user.model';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from 'app/shared/state/appState';
import { ErrorService }                           from 'app/core/error/error.service';

@Component({
  selector: 'delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.sass'],
})
export class DeleteAccountComponent {
  disableButtons = false;
  userPassword: string;
  subscriptions: any;

  constructor(private modalService: ModalService,
              private userActions: UserActions,
              private userService: UserService,
              private store: Store<AppState>,
              private errorService: ErrorService) { }

  cancel() {
    if (!this.disableButtons) {
      this.modalService.close();
    }
  }

  delete() {
    if (!this.disableButtons) {
      this.disableButtons = true;

      this.userService.deleteAccount(this.userPassword).then(() => {
        this.store.dispatch(this.userActions.clearUser());
        this.disableButtons = false;
        this.modalService.close();
      })
        .catch(error => {
          console.log('error is: ', error);
          this.disableButtons = false;
          if (error.status === 401) {
            this.showError(`Incorrect Password!`);
          } else {
            this.showError(`Something went wrong! please try again`);
          }
          this.modalService.close();
        });
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

}
