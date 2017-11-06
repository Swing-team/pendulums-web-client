import 'rxjs/add/operator/toPromise';
import * as io from 'socket.io-client';
import { Inject, Injectable }           from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { APP_CONFIG }                   from '../../app.config';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../../shared/state/appState';
import { StatusActions }                from '../../shared/state/status/status.actions';
import { DatabaseService }              from './database/database.service';
import { UserActions }                  from '../../shared/state/user/user.actions';
import { ProjectsActions }              from '../../shared/state/project/projects.actions';
import { CurrentActivityActions }       from '../../shared/state/current-activity/current-activity.actions';
import { UnSyncedActivityActions }      from 'app/shared/state/unsynced-activities/unsynced-activities.actions';
import { Router }                       from '@angular/router';
import { UserService }                  from './user.service';

@Injectable()
export class SyncService {
  private socket = null;
  private tempState: any;
  constructor(@Inject(APP_CONFIG) private config,
              private http: HttpClient,
              private router: Router,
              private userService: UserService,
              private store: Store<AppState>,
              private StatusActions: StatusActions,
              private dBService: DatabaseService,
              private userActions: UserActions,
              private projectsActions: ProjectsActions,
              private currentActivityActions: CurrentActivityActions,
              private unSyncedActivityActions: UnSyncedActivityActions) {
  }

  init(): void {
    this.getStateFromDb().then(() => {
      console.log('found data at db');
      this.initialAppOffline();
      this.socket = io(this.config.socketEndpoint, {transports: ['websocket'], upgrade: true});
      this.socket.on('connect', () => {
        console.log('websocket connected!');
        this.autoSync();
        this.store.dispatch(this.StatusActions.updateNetStatus(true));
        this.socket.emit('get', {
          method: 'get',
          url: '/socket/subscribe-to-events',
        }, () => {
          // listen to events
        });
      });

      this.socket.on('disconnect', (error) => {
        console.log('websocket disconnected!');
        this.store.dispatch(this.StatusActions.updateNetStatus(false));
      });
    }).catch(() => {
      console.log('no proper data at db');
      this.getSummaryOnline();
    });
  }

  syncData(data): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/sync/activities', JSON.stringify(data), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => {
      console.log('Offline activities has been sync with server successfully :)');
    })
      .catch(this.handleError);
  }

  getStateFromDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      let uId: string;
      this.dBService
        .getAll('activeUser')
        .then((data) => {
          if (data.length > 0) {
            uId = data[0].data;
            this.dBService
              .get('userData', uId)
              .then((userData) => {
                if (userData) {
                  this.tempState = userData.data;
                  resolve();
                }
              }).catch(() => {
              reject();
            });
          } else {
            reject();
          }
        }).catch(() => {
        reject();
      });
    });
  }

  autoSync(): void {
    if (this.tempState) {
      const syncData = {
        currentActivity: null,
        activities: null
      };
      if (this.tempState.unSyncedActivity.entities.length > 0) {
        syncData.activities = this.tempState.unSyncedActivity.entities;
      }
      if (this.tempState.currentActivity.startedAt) {
        syncData.currentActivity = this.tempState.currentActivity;
      }
      if (syncData.currentActivity || syncData.activities) {
        console.log('sync call');
        console.log('syncData', syncData);
        this.syncData(syncData)
          .then(() => {
            this.store.dispatch(this.unSyncedActivityActions.clearUnSyncedActivity());
            this.tempState.activities = null;
            this.getSummaryOnline();
          })
          .catch(error => {
            console.log('error is: ', error);
            if (error.status === 403) {
              // this.router.navigate(['signIn']);
            } else {
              // todo: handle sync errors based on corrupted data
              this.getSummaryOnline();
            }
          });
      } else {
        this.getSummaryOnline();
      }
    } else {
      this.getSummaryOnline();
    }
  }

  getSummaryOnline() {
    this.userService.getSummary()
      .then((user) => {
        console.log('loaded from server!');
        this.store.dispatch(this.userActions.loadUser(user));
        this.store.dispatch(this.projectsActions.loadProjects(user.projects));
        this.store.dispatch(this.currentActivityActions.loadCurrentActivity(user.currentActivity));
        this.store.dispatch(this.StatusActions.loadStatus({netStatus: true, isLogin: true}));
        this.dBService
          .removeAll('activeUser')
          .then(() => {
            this.dBService
              .createOrUpdate('activeUser', {data: user.id})
              .then(() => {});
          });
        if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
          this.router.navigate(['dashboard']);
        }
      })
      .catch(error => {
        if (error.status !== 403) {
          this.initialAppOffline();
        } else {
          console.log('error is: ', error);
          this.router.navigate(['signIn']);
        }
      });
  }

  initialAppOffline() {
    if (this.tempState) {
      console.log('loaded from index db');
      this.store.dispatch(this.userActions.loadUser(this.tempState.user));
      this.store.dispatch(this.projectsActions.loadDbProjects(this.tempState.projects.entities));
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(this.tempState.currentActivity));
      this.store.dispatch(this.unSyncedActivityActions.loadUnSyncedActivity(this.tempState.unSyncedActivity));
      if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate(['signIn']);
    }
  }

  closeConnection(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
