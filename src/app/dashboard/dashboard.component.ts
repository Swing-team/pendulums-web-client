import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import { Component, OnInit, Output,
         OnDestroy }                    from '@angular/core';
import { Subscription }                 from 'rxjs/Subscription';
import { Observable }                   from 'rxjs/Observable';
import { DatabaseService }              from '../core/services/database/database.service';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../shared/state/appState';
import { ModalService }                 from '../core/modal/modal.service';
import { AppService }                   from '../core/services/app.service';
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
               private appService: AppService,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.currentActivity = store.select('currentActivity');
    this.user = store.select('user');
    this.status = store.select('status');
    this.projects = store.select(appStateSelectors.getProjectsArray);
    this.hasSeenInfoModal = false
  }

  ngOnInit() {
    this.getServerMessage()
    if (!this.hasSeenInfoModal) {
      this.versionControl = this.user.pairwise().subscribe((userInfo) => {
        if (userInfo[0].id === null || userInfo[0].id === undefined || userInfo[0].id === '' || userInfo[1].id !== userInfo[0].id) {
          this.userId = userInfo[1].id;
        } else {
          this.userId = userInfo[0].id
        }
        // FIXME: Mohammad 08-24-2018: cleanup this code!!!
        // the userInDB is {userId: '...', seenVersions: [...]}
        this.db.get('appInfo', this.userId)
        .then((userInDB) => {
          if (userInDB === undefined || userInDB === null || userInDB === '') {
            this.db.createOrUpdate('appInfo', {
              userId: this.userId,
              seenVersions: [VERSION]
            });
            this.showAppInfoModal();
            this.hasSeenInfoModal = true;
          } else if (userInDB.userId === null || userInDB.userId === undefined || userInDB.userId === '') {
            this.db.createOrUpdate('appInfo', {
              userId: this.userId,
              seenVersions: [VERSION]
            });
            this.showAppInfoModal();
            this.hasSeenInfoModal = true;
          } else if (userInDB.seenVersions === null || userInDB.seenVersions === undefined || userInDB.seenVersions === '') {
            this.db.createOrUpdate('appInfo', {
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


