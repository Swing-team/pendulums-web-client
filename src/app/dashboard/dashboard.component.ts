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
import { Project }                      from 'app/shared/state/project/project.model';
import { Status }                       from 'app/shared/state/status/status.model';
import { AreaChartInterface } from 'app/models/charts-model/area-chart-model';
import { RecentActivityWithProject } from 'app/widgets/recent-activities/model/recent-activities-with-project.model';
import { Note } from 'app/shared/state/note/note.model';
import { AppStateSelectors } from 'app/shared/state/app-state.selectors';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Output() serverMessage: any;

  user$: Observable<User>;
  user: User;
  status$: Observable<Status>;
  projects$: Observable<Project[]>;
  currentActivity$: Observable<Activity>;
  projectsId: Object = {};
  recentNotes: Note[] = [];
  recentProjects: Project[];
  recentActivitiesWithProject: RecentActivityWithProject[] = [];
  subscriptions: Subscription[] = [];
  hasSeenInfoModal: boolean;
  selectItems: string[] = [];
  areaChartData: AreaChartInterface[];

  constructor (private store: Store<AppState>,
               private db: DatabaseService,
               private modalService: ModalService,
               private appStateSelectors: AppStateSelectors,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.user$ = store.select('user');
    this.status$ = store.select('status');
    this.projects$ = store.select(this.appStateSelectors.getProjectsArray)
    this.currentActivity$ = store.select('currentActivity');
    this.hasSeenInfoModal = false;
    this.selectItems = ['last day', 'last week', 'last month', 'last 3 month', 'last year'];
  }

  ngOnInit() {
    if (!this.hasSeenInfoModal) {
      this.subscriptions.push(
        this.user$.subscribe((userInfo) => {
          this.user = userInfo;

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

    this.prepareRecentActivities();
    this.prepareRecentProjects();
    this.prepareRecentNotes();
  }

  prepareRecentActivities() {
    // TODO: We need to call a service to get recent activities in here
  }

  prepareRecentProjects() {
    // TODO: We need to call a service to get recent projects in here
    this.subscriptions.push(
      this.projects$.subscribe((projects) => {
        this.recentProjects = projects.sort((p1, p2) => {
          const a1 = p1.activities.find(a => a.user === this.user.id);
          const a2 = p2.activities.find(a => a.user === this.user.id);
          if (!a1) {
            return -1;
          }
          if (!a2) {
            return 1;
          }
          if (!a1.stoppedAt) {
            return 1;
          }
          if (!a2.stoppedAt) {
            return -1;
          }
          return a1.stoppedAt >= a2.stoppedAt ? 1 : -1;
        });
      }),
    );
  }

  prepareRecentNotes() {
    this.subscriptions.push(this.projects$.subscribe((params: any) => {
      this.projectsId = params.reduce((obj, project) => ({...obj, [project.id]: project.name}), {})
    }));
    // TODO: we need to call a service to get recent notes in here
  }

  areaChartSelectItemChanged(event: {index: number; selectedItem: string}) {
    // TODO: we need to call a service to get events based on duration.
    this.areaChartData = [
      {
        name: 'this is not important',
        series: [
          {
            name: 'date 1',
            value: Math.random() * 60 * 60 * 1000,
          },
          {
            name: 'date 2',
            value: Math.random() * 60 * 60 * 1000,
          },
          {
            name: 'date 3',
            value: Math.random() * 60 * 60 * 1000,
          },
          {
            name: 'date 4',
            value: Math.random() * 60 * 60 * 1000,
          },
          {
            name: 'date 5',
            value: Math.random() * 60 * 60 * 1000,
          },
        ],
      }
    ]
  }

  trimAreaChartYAxis(duration: number): string {
    let x = duration / 1000;
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    let result: string;
    if (minutes < 10) {
      result = hours + ':0' + minutes ;
    } else {
      result = hours + ':' + minutes ;
    }

    return result;
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

