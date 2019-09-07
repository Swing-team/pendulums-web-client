import { Component }                              from '@angular/core';
import { Router }                                 from '@angular/router';
import { ModalService }                           from '../../core/modal/modal.service';
import { UserActions }                            from '../../shared/state/user/user.actions';
import { UserService }                            from '../../core/services/user.service';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from 'app/shared/state/appState';
import { ErrorService }                           from 'app/core/error/error.service';
import { DatabaseService }                        from 'app/core/services/database/database.service';

@Component({
  selector: 'delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.sass'],
})
export class DeleteAccountComponent {
  disableButtons = false;
  userPassword: string;

  constructor(private modalService: ModalService,
              private userActions: UserActions,
              private userService: UserService,
              private store: Store<AppState>,
              private databaseService: DatabaseService,
              private router: Router,
              private errorService: ErrorService) { }

  cancel() {
    if (!this.disableButtons) {
      this.modalService.close();
    }
  }

  delete() {
    if (!this.disableButtons) {
      this.disableButtons = true;
      this.userService.deleteAccount(this.userPassword).then((userId) => {
        this.disableButtons = false;
        this.modalService.close();
        this.store.dispatch(this.userActions.clearUser());
        this.databaseService.remove('appInfo', userId);
        this.databaseService.remove('userData', userId);
        this.databaseService.removeAll('activeUser');
        this.router.navigate(['signIn']);
      })
        .catch(error => {
          console.log('error is: ', error);
          this.disableButtons = false;
          if (error.status === 400) {
            this.showError(`Incorrect Password!`);
          } else if (error.status === 403) {
            this.showError(`you are not allow to perform this action`);
            this.modalService.close();
          } else {
            this.showError('Something went wrong! please try again');
            this.modalService.close();
          }
        });
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

}
