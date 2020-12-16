import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from 'environments/environment';
import { Md5 } from 'ts-md5';
import { ErrorService } from 'app/core/error/error.service';
import { SyncService } from 'app/core/services/sync.service';
import { User } from 'app/shared/state/user/user.model';
import { Status } from 'app/shared/state/status/status.model';
import { AppState } from 'app/shared/state/appState';
import { AppInfoComponent } from '../app-info/app-info.component';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.sass'],
})
export class TopBarComponent implements OnInit, OnDestroy {
  @Output() onSignoutClicked = new EventEmitter();
  user$: Observable<User>;
  user: User;
  status$: Observable<Status>
  status: Status;
  notificationNumber: number;
  hasNotification: boolean;
  subscriptions: Subscription[] = [];
  environment = environment;
  emailHash: string;
  syncing = false;
  isProfileDropDownOpen = false;
  isNotificationDropDownOpen = false;

  constructor(
    private store: Store<AppState>,
    private errorService: ErrorService,
    private syncService: SyncService,
    private modalService: ModalService,
  ) {
    this.status$ = this.store.select('status')
    this.user$ = this.store.select('user');
  }


  ngOnInit() {
    this.subscriptions.push(this.status$.subscribe((status) => this.status = status));
    this.subscriptions.push(this.user$.subscribe((user) => {
      this.user = user;
      if (this.user.email) {
        this.emailHash = Md5.hashStr(this.user.email).toString();
      }
    }));

    if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
      this.hasNotification = true;
    }
  }

  ngDoCheck() {
    // const change = this.differ.diff(this.user.pendingInvitations);
    // if (change) {
    //   if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
    //     this.hasNotification = true;
    //   } else {
    //     this.hasNotification = false;
    //   }
    // }
  }

  syncSummary() {
    if (!this.status.netStatus) {
      this.showError('You cannot sync your data when you are offline' );
    } else {
      this.syncing = true;
      Promise.all(this.syncService.autoSync())
        .then(() => this.syncing = false)
        .catch(() => this.syncing = false);
    }
  }

  toggleProfileDropDown() {
    this.isProfileDropDownOpen = !this.isProfileDropDownOpen;
  }

  toggleNotificationDropDown() {
    this.isNotificationDropDownOpen = !this.isNotificationDropDownOpen;
  }

  showAppInfo() {
    this.modalService.show({
      component: AppInfoComponent,
      inputs: {}
    });
  }

  signout() {
    if (this.status.netStatus) {
      this.onSignoutClicked.emit();
    } else {
      this.showError('You cannot sign out from your account when you are offline' );
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutOfDropDown(event) {
    if (this.isProfileDropDownOpen && (event.target.id !== 'profileDropDownTrigger')) {
      this.isProfileDropDownOpen = false;
    }
    if (this.isNotificationDropDownOpen && (event.target.id !== 'notificationDropDownTrigger')) {
      this.isNotificationDropDownOpen = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
