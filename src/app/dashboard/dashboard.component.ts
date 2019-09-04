import { Component, OnInit, Output,
         OnDestroy }                    from '@angular/core';
import { Subscription }                 from 'rxjs/Subscription';
import { Observable }                   from 'rxjs/Observable';
import { DatabaseService }              from '../core/services/database/database.service';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../shared/state/appState';
import { ModalService }                 from '../core/modal/modal.service';
import { AppStateSelectors }            from '../shared/state/app-state.selectors';
import { AppInfoComponent }             from '../core/side-menu/app-info/app-info.component';
import { RouterChangeListenerService }  from '../core/services/router-change-listener.service';
import { VERSION }                      from 'environments/version';
import { HttpClient }                   from '@angular/common/http';
import { environment }                  from '../../environments/environment';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Output() serverMessage: any;

  projects: Observable<any>;
  sortBy: Observable<string>;
  user: Observable<any>;
  currentActivity: Observable<any>;
  status: Observable<any>;
  userId: string;
  versionControl: Subscription;
  hasSeenInfoModal: boolean;

  constructor (private store: Store<AppState>,
               appStateSelectors: AppStateSelectors,
               private db: DatabaseService,
               private modalService: ModalService,
               private http: HttpClient,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.currentActivity = store.select('currentActivity');
    this.user = store.select('user');
    this.status = store.select('status');
    this.projects = store.select(appStateSelectors.getProjectsArray);
    this.sortBy = store.select(appStateSelectors.getProjectsSortBy);
    this.hasSeenInfoModal = false
  }

  ngOnInit() {
    this.getServerMessage();
    if (!this.hasSeenInfoModal) {
      this.versionControl = this.user.subscribe((userInfo) => {
        if (userInfo && userInfo.id && userInfo.id.length > 0 && this.userId !== userInfo.id) {
          this.userId = userInfo.id;
          // the userInDB is {userId: '...', seenVersions: [...]}
          this.db.get('appInfo', this.userId)
          .then((userInDB) => {
            if (!userInDB || userInDB === '' || !userInDB.userId || userInDB.userId === ''
              || !userInDB.seenVersions || userInDB.seenVersions === '') {
              this.db.createOrUpdate('appInfo', {
                userId: this.userId,
                seenVersions: [VERSION]
              });
              this.showAppInfoModal();
              this.hasSeenInfoModal = true;
            } else if (userInDB.seenVersions.indexOf(VERSION) < 0) {
              // check for existing version that user saw
              const seenVersionsArray = userInDB.seenVersions;
              seenVersionsArray.push(VERSION);
              this.db.update('appInfo', this.userId, {
                seenVersions: seenVersionsArray
              });
              this.showAppInfoModal();
              this.hasSeenInfoModal = true;
            }
          })
          .catch((err) => console.log(err));
        }
      });
    }
  }
  getServerMessage(): Promise<any> {
    return this.http
      .get(environment.apiEndpoint + '/serverMessage', environment.httpOptions)
      .toPromise()
      .then(response => {
        this.serverMessage = (response as any).serverMessage
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }

  ngOnDestroy() {
    this.versionControl.unsubscribe();
  }


  showAppInfoModal() {
    this.modalService.show({
      component: AppInfoComponent,
      inputs: {}
    });
  }
}


