import { Component, OnInit, Output,
         OnDestroy }                    from '@angular/core';
import { Subscription ,  Observable }   from 'rxjs';
import { DatabaseService }              from '../core/services/database/database.service';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../shared/state/appState';
import { ModalService }                 from '../core/modal/modal.service';
import { AppInfoComponent }             from '../core/side-menu/app-info/app-info.component';
import { RouterChangeListenerService }  from '../core/services/router-change-listener.service';
import { VERSION }                      from 'environments/version';
import { environment }                  from '../../environments/environment';
import { User }                         from 'app/shared/state/user/user.model';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Output() serverMessage: any;

  user$: Observable<User>;
  subscriptions: Subscription[] = [];
  hasSeenInfoModal: boolean;

  constructor (private store: Store<AppState>,
               private db: DatabaseService,
               private modalService: ModalService,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.user$ = store.select('user');
    this.hasSeenInfoModal = false
  }

  ngOnInit() {
    if (!this.hasSeenInfoModal) {
      this.subscriptions.push(
        this.user$.subscribe((userInfo) => {
          if (userInfo && userInfo.id) {
            // the userInDB is {userId: '...', seenVersions: [...]}
            this.db.get('appInfo', userInfo.id)
            .then((userInDB) => {
              if (!userInDB || !userInDB.userId || !userInDB.seenVersions) {
                this.db.createOrUpdate('appInfo', {
                  userId: userInfo.id,
                  seenVersions: [VERSION]
                });
                this.showAppInfoModal();
                this.hasSeenInfoModal = true;
              } else if (userInDB.seenVersions.indexOf(VERSION) < 0) {
                // check for existing version that user saw
                userInDB.seenVersions.push(VERSION);
                this.db.update('appInfo', userInfo.id, {
                  seenVersions: userInDB.seenVersions,
                });
                this.showAppInfoModal();
                this.hasSeenInfoModal = true;
              }
            })
            .catch((err) => console.log(err));
          }
        })
      );
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }


  showAppInfoModal() {
    this.modalService.show({
      component: AppInfoComponent,
      inputs: {}
    });
  }
}

