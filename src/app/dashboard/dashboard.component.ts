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

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Output() serverMessage: any;

  user$: Observable<User>;
  status$: Observable<Status>;
  recentProjects: Project[];
  recentActivitiesWithProject: RecentActivityWithProject[] = [];
  subscriptions: Subscription[] = [];
  hasSeenInfoModal: boolean;
  selectItems: string[] = [];
  areaChartData: AreaChartInterface[];

  constructor (private store: Store<AppState>,
               private db: DatabaseService,
               private modalService: ModalService,
               // this service needed to handle router changes so don't remove it
               private routerChangeListenerService: RouterChangeListenerService) {

    this.user$ = store.select('user');
    this.status$ = store.select('status');
    this.hasSeenInfoModal = false;
    this.selectItems = ['last day', 'last week', 'last month', 'last 3 month', 'last year'];
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

    this.prepareRecentActivities();
  }

  prepareRecentActivities() {
    // TODO: We need to call a service to get recent activities in here
  }

  prepareRecentProjects() {
    // TODO: We need to call a service to get recent projects in here
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

