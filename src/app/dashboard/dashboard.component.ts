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
import { DoughnutChartInterface }       from './shared/charts-model/doughnut-chart.model';
import { AreaChartInterface }           from './shared/charts-model/area-chart-model';
import * as moment from 'moment';

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
  doughnutChartStats: Array<DoughnutChartInterface>;
  doughnutCalenderShow = false;
  doughnutDateString: string;
  doughnutStartTime: number;
  doughnutEndTime: number;
  areaChartCalenderShow = false;
  areaChartDateString: string;
  areaChartStats: Array<AreaChartInterface>;
  todayDate: number;

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
    
    this.todayDate = moment.now();
    this.updateAreaChartStat(moment());
    this.updateDoughnutStat({
      start: moment().subtract(7, 'days'),
      end: moment()
    });
    
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

  formatHoursTick(time: number) {
    time = time / 1000;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - (hours * 3600)) / 60);

    let hoursString = hours.toString();
    let minutesString = minutes.toString();

    if (hours   < 10) {hoursString   = '0' + hours; }
    if (minutes < 10) {minutesString = '0' + minutes; }
    const result = hoursString + ': ' + minutesString;
    return result;
  }

  formatDateTick(date: string) {
    const newDate = new Date(date);
    return newDate.getFullYear().toString().substring(2) + '-' + newDate.getMonth() + '-' + newDate.getDate();
  }

  doughnutToolTipText({ data }) {
    let time = data.value;
    time = time / 1000;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - (hours * 3600)) / 60);

    let hoursString = hours.toString();
    let minutesString = minutes.toString();

    if (hours   < 10) {hoursString   = '0' + hours; }
    if (minutes < 10) {minutesString = '0' + minutes; }
    const duration = hoursString + ': ' + minutesString;
    
    return `
      <span class="tooltip-label">${data.label}</span>
      <span class="tooltip-val">${duration}</span>
    `;
  }

  showDoughnutCalender() {
    this.doughnutCalenderShow = true;
  }

  closeDoughnutCalender() {
    this.doughnutCalenderShow = false;
  }
  
  showAreaChartCalender() {
    this.areaChartCalenderShow = true;
  }

  closeAreaChartCalender() {
    this.areaChartCalenderShow = false;
  }

  updateDoughnutStat(event: {start: moment.Moment, end: moment.Moment}) {
    this.doughnutDateString = event.start.format('MMM Do');
    const firstIdsMonth =  event.start.month();
    const secondIdsMonth =  event.end.month();
    let temp = '';
    if (firstIdsMonth === secondIdsMonth) {
      temp = event.end.format('Do');
    } else {
      temp = event.end.format('MMM Do');
    }
    this.doughnutDateString = this.doughnutDateString + ' - ' + temp;

    this.doughnutStartTime = event.start.startOf('day').valueOf();
    this.doughnutEndTime = (event.end.add(1, 'days')).startOf('day').valueOf();
    // TODO: get data from service here
    this.doughnutCalenderShow = false
  }

  updateAreaChartStat(event: moment.Moment) {
    this.areaChartDateString = event.format('MMM Do');
    const date = event.format('YYYY-M-D');
    // TODO: get data from service here
    this.areaChartCalenderShow = false;
  }
}


