import { Component, Input, OnInit, OnDestroy, DoCheck, KeyValueDiffers } from '@angular/core';
import { SideMenuService } from 'app/core/services/side-menu.service';
import { Subscription, Observable } from 'rxjs';
import { User } from '../state/user/user.model';
import { Status } from '../state/status/status.model';
import { Store } from '@ngrx/store';
import { AppState } from '../state/appState';
import { environment } from 'environments/environment';
import { Md5 } from 'ts-md5';
import { ErrorService } from 'app/core/error/error.service';
import { SyncService } from 'app/core/services/sync.service';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.sass'],
})
export class TopBarComponent implements OnInit, OnDestroy, DoCheck {
  @Input() title: string;
  @Input() showDonationButton: boolean = true;

  user$: Observable<User>;
  user: User;
  status$: Observable<Status>
  status: Status;
  hasNotification: boolean;
  isSideMenuActive: boolean;
  subscriptions: Subscription[] = [];
  differ: any;
  environment = environment;
  emailHash: string;
  syncing = false;

  constructor(
    private readonly sideMenuService: SideMenuService,
    private store: Store<AppState>,
    private differs: KeyValueDiffers,
    private errorService: ErrorService,
    private syncService: SyncService,
  ) {
    this.status$ = store.select('status')
    this.user$ = store.select('user');
    this.differ = this.differs.find({}).create();
  }


  ngOnInit() {
    this.subscriptions.push(this.status$.subscribe((status) => this.status = status));
    this.subscriptions.push(this.user$.subscribe((user) => {
      this.user = user;
      if (this.user.email) {
        this.emailHash = Md5.hashStr(this.user.email).toString();
      }
    }));

    this.subscriptions.push(
      this.sideMenuService.getIsSideMenuActiveAsObservable().subscribe((isSideMenuActive) => {
        this.isSideMenuActive = isSideMenuActive;
      })
    );

    if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
      this.hasNotification = true;
    }
  }

  ngDoCheck() {
    const change = this.differ.diff(this.user.pendingInvitations);
    if (change) {
      if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
        this.hasNotification = true;
      } else {
        this.hasNotification = false;
      }
    }
  }

  changeIsSideMenuActiveState() {
    this.sideMenuService.changeIsSideMenuActive(!this.isSideMenuActive);
  }

  syncSummary() {
    if (!this.status.netStatus) {
      this.showError('Not available in offline mode' );
    } else {
      this.syncing = true;
      Promise.all(this.syncService.autoSync())
        .then(() => this.syncing = false)
        .catch(() => this.syncing = false);
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
