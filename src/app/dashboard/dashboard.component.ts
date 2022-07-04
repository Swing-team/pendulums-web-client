import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription ,  Observable }   from 'rxjs';
import { DatabaseService }              from '../core/services/database/database.service';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../shared/state/appState';
import { ModalService }                 from '../core/modal/modal.service';
import { AppInfoComponent }             from '../core/app-info/app-info.component';
import { RouterChangeListenerService }  from '../core/services/router-change-listener.service';
import { VERSION }                      from 'environments/version';
import { User }                         from 'app/shared/state/user/user.model';
import { Project }                      from 'app/shared/state/project/project.model';
import { Status }                       from 'app/shared/state/status/status.model';
import { AreaChartInterface } from 'app/models/charts-model/area-chart-model';
import { Note } from 'app/shared/state/note/note.model';
import { AppStateSelectors } from 'app/shared/state/app-state.selectors';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { DashboardService } from './dashboard.service';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  serverMessage: any = null;
  user$: Observable<User>;
  user: User;
  status$: Observable<Status>;
  projects$: Observable<Project[]>;
  currentActivity$: Observable<Activity>;
  projectsId: Object = {};
  notes$: Observable<Note[]>;
  recentNotes: Note[] = [];
  recentProjects: Project[];
  subscriptions: Subscription[] = [];
  hasSeenInfoModal: boolean;
  selectItems: string[] = ['last week', 'last month', 'last 3 months', 'last year'];
  areaChartData: AreaChartInterface[] = [];
  previouslyChartFetchedFrom: number;
  previouslyChartFetchedTo: number;

  constructor (
    private store: Store<AppState>,
    private db: DatabaseService,
    private modalService: ModalService,
    private appStateSelectors: AppStateSelectors,
    // this service needed to handle router changes so don't remove it
    private routerChangeListenerService: RouterChangeListenerService,
    private dashboardService: DashboardService,
    private cookieService: CookieService,
  ) {
    this.user$ = this.store.select('user');
    this.status$ = this.store.select('status');
    this.projects$ = this.store.select(this.appStateSelectors.getProjectsArrayWithCustomSort, '-activity');
    this.notes$ = this.store.select(this.appStateSelectors.getActiveNotesSortedBy, { sortBy: '-updateDate' });
    this.currentActivity$ = this.store.select('currentActivity');
    this.hasSeenInfoModal = false;
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

    this.prepareRecentProjects();
    this.prepareStats({ index: 0 });
    this.prepareRecentNotes();
    this.getServerMessage();
  }

  prepareRecentProjects() {
    this.subscriptions.push(this.projects$.subscribe((projects) => this.recentProjects = projects));
  }

  prepareRecentNotes() {
    this.subscriptions.push(this.projects$.subscribe((params: any) => {
      this.projectsId = params.reduce((obj, project) => ({...obj, [project.id]: project.name}), {})
    }));

    this.subscriptions.push(this.notes$.subscribe((notes) => this.recentNotes = notes));
  }

  async prepareStats(event?: {index: number; selectedItem?: string}) {
    if (event) {
      let from = 0;
      let to = moment(Date.now()).endOf('day').valueOf();

      switch (event.index) {
        case 0: {
          from = moment(Date.now()).subtract(6, 'days').startOf('day').valueOf();
          break;
        }
        case 1: {
          from = moment(Date.now()).subtract(29, 'days').startOf('day').valueOf();
          break;
        }
        case 2: {
          from = moment(Date.now()).subtract(89, 'days').startOf('day').valueOf();
          break;
        }
        case 3: {
          from = moment(Date.now()).subtract(364, 'days').startOf('day').valueOf();
          break;
        }
      }
      this.previouslyChartFetchedFrom = from;
      this.previouslyChartFetchedTo = to;
    }
    const res = await this.dashboardService.getUserStats(this.previouslyChartFetchedFrom, this.previouslyChartFetchedTo);

    if (res && res.result) {
      this.areaChartData = [{
        name: 'Your stats',
        series: res.result.map((column, index) => {
          let xAxisName =  moment(Number(column._id)).format('MMM Do');
          if (res.columnSize !== 1) {
            let nextBoundaryId = this.previouslyChartFetchedTo;
            if (index + 2 <= res.result.length) {
              nextBoundaryId = Number(res.result[index + 1]._id) - 1;
            }
            const firstIdsMonth =  moment(Number(column._id)).month();
            const secondIdsMonth =  moment(nextBoundaryId).month();
            if (firstIdsMonth === secondIdsMonth) {
              xAxisName += '-' + moment(nextBoundaryId).format('Do');
            } else {
              xAxisName += '-' + moment(nextBoundaryId).format('MMM Do');
            }
          }
          return { name: xAxisName, value: column.value}
        })
      }];
    }
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

  getServerMessage(): Promise<any> {
    return this.dashboardService.getServerMessage()
      .then(serverMessage => {
        this.serverMessage = (serverMessage && (this.cookieService.get('serverMessageId') !== serverMessage.id))
          ? serverMessage : null;
      });
  }

  dismiss() {
    this.cookieService.set( 'serverMessageId', this.serverMessage.id );
    this.serverMessage = null;
  }

  showAppInfoModal() {
    this.modalService.show({
      component: AppInfoComponent,
      inputs: {}
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}

