import { Component, OnInit, Output,
         OnDestroy }                    from '@angular/core';
import { Subscription ,  Observable }                 from 'rxjs';
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
import { CreateProjectComponent }       from './projects/create-project/create-project.component';
import { Status }                       from 'app/shared/state/status/status.model';
import { User }                         from 'app/shared/state/user/user.model';
import { Project }                      from 'app/shared/state/project/project.model';
import { Activity }                     from 'app/shared/state/current-activity/current-activity.model';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Output() serverMessage: any;

  projects: Observable<Project[]>;
  sortBy: Observable<string>;
  user$: Observable<User>;
  user: User;
  currentActivity: Observable<Activity>;
  status$: Observable<Status>;
  status: Status;
  userId: string;
  subscriptions: Subscription[] = [];
  hasSeenInfoModal: boolean;

  constructor (private store: Store<AppState>,
               appStateSelectors: AppStateSelectors,
               private db: DatabaseService,
               private modalService: ModalService,
               private http: HttpClient,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.currentActivity = store.select('currentActivity');
    this.user$ = store.select('user');
    this.status$ = store.select('status');
    this.projects = store.select(appStateSelectors.getProjectsArray);
    this.sortBy = store.select(appStateSelectors.getProjectsSortBy);
    this.hasSeenInfoModal = false
  }

  ngOnInit() {
    this.getServerMessage();
    if (!this.hasSeenInfoModal) {
      this.subscriptions.push(
        this.user$.subscribe((userInfo) => {
          this.user = userInfo;
          
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
        })
      );
    }

    this.subscriptions.push(
      this.status$.subscribe((status) => {
        this.status = status;
      })
    );
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

  openCreateProjectModal() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: CreateProjectComponent,
        inputs: {
          currentUser: this.user
        }
      });
    } else {
      this.handleError('Not available in offline mode');
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


