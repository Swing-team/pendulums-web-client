import 'rxjs/add/operator/toPromise';
import * as io                          from 'socket.io-client';
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
import { AppService }                   from './app.service';
import { Observable }                   from 'rxjs/Observable';
import { Status }                       from '../../shared/state/status/status.model';

@Injectable()
export class SyncService {
  private socket = null;
  private tempState: any;
  private status: Observable<any>;
  private currentActivity: Observable<any>;
  private currentActivityProjectId: string;
  private isLogin: boolean;
  private responseResults: Promise<any>[] = [];

  constructor(@Inject(APP_CONFIG) private config,
              private http: HttpClient,
              private router: Router,
              private userService: UserService,
              private store: Store<AppState>,
              private statusActions: StatusActions,
              private dBService: DatabaseService,
              private userActions: UserActions,
              private projectsActions: ProjectsActions,
              private currentActivityActions: CurrentActivityActions,
              private unSyncedActivityActions: UnSyncedActivityActions,
              private appService: AppService) {
    this.status = store.select('status');
    this.currentActivity = store.select('currentActivity');
    this.status.subscribe((status: Status) => {
      this.isLogin = status.isLogin;
    });
    this.currentActivity.subscribe((currentActivity) => {
      this.currentActivityProjectId = currentActivity.project;
    });
  }

  init(): any {
    this.responseResults.push(
      this.getStateFromDb().then(() => {
        this.initialAppOffline();
        this.connectSocket();
      }).catch(() => {
        if (this.isLogin) {
          this.connectSocket();
        }
      })
    );
    return this.responseResults;
  }

  syncData(data): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/sync/activities' + '/activities?socketId=' + this.getSocketId()
      , JSON.stringify(data), {...this.config.httpOptions, responseType: 'text'})
      .toPromise()
      .then(() => {
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

  autoSync(): Promise<any>[] {
    if (this.tempState) {
      const syncData = {
        currentActivity: null,
        activities: null
      };
      if (this.tempState.unSyncedActivity && this.tempState.unSyncedActivity.entities.length > 0) {
        syncData.activities = this.tempState.unSyncedActivity.entities;
      }
      if (this.tempState.currentActivity && this.tempState.currentActivity.startedAt) {
        syncData.currentActivity = this.tempState.currentActivity;
        delete syncData.currentActivity.stoppedAt;
      }
      if (syncData.currentActivity || syncData.activities) {
        this.responseResults.push(this.syncData(syncData)
          .then(() => {
            this.store.dispatch(this.unSyncedActivityActions.clearUnSyncedActivity());
            this.tempState.currentActivity = null;
            this.tempState.unSyncedActivity = null;
            this.getSummaryOnline();
          })
          .catch(error => {
            console.log('error is: ', error);
            if (error.status === 403 || error.status === 504) {
              // do nothing
            } else {
              // todo: handle sync errors based on corrupted data
              this.getSummaryOnline();
            }
          }))
      } else {
        this.getSummaryOnline();
      }
    } else {
      this.getSummaryOnline();
    }
    return this.responseResults;
  }

  connectSocket() {
    this.socket = io(this.config.socketEndpoint, {path: this.config.socketPath, transports: ['websocket'], upgrade: true});
    this.socket.on('connect', () => {
      console.log('websocket connected!');
      this.getStateFromDb().then(() => {
        this.autoSync();
      }).catch(() => {
        this.getSummaryOnline();
      });
      this.store.dispatch(this.statusActions.updateNetStatus(true));
      this.socket.emit('get', {
        method: 'get',
        url: '/socket/subscribe-to-events',
      }, () => {
        // listen to events
      });
    });

    this.socket.on('message', (data) => {
      if (data.type === 'projectRemoved') {
        this.store.dispatch(this.projectsActions.removeProject(data.data.toString()));

        // if we have current activity on deleted project we should clear it
        if (this.currentActivityProjectId && (this.currentActivityProjectId.toString() === data.data.toString())) {
          this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        }
      }

      if (data.type === 'syncNeeded') {
        Promise.all(this.responseResults).then(() => {
          this.autoSync();
        }).catch(() => {
          console.log('Sync Needed')
        });
      }
    });

    this.socket.on('disconnect', (error) => {
      console.log('websocket disconnected!');
      this.store.dispatch(this.statusActions.updateNetStatus(false));
    });
  }

  getSummaryOnline() {
    this.responseResults.push(this.userService.getSummary()
      .then((user) => {
        this.store.dispatch(this.userActions.loadUser(user));
        this.store.dispatch(this.projectsActions.loadProjects(user.projects));
        if (user.currentActivity) {
          this.store.dispatch(this.currentActivityActions.loadCurrentActivity(user.currentActivity));
        } else {
          this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        }
        this.store.dispatch(this.statusActions.updateStatus({netStatus: true, isLogin: true}));
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
      }));
  }

  initialAppOffline() {
    if (this.tempState) {
      this.store.dispatch(this.userActions.loadUser(this.tempState.user));
      this.store.dispatch(this.projectsActions.loadDbProjects(this.tempState.projects));
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(this.tempState.currentActivity));
      this.store.dispatch(this.unSyncedActivityActions.loadUnSyncedActivity(this.tempState.unSyncedActivity));
      this.store.dispatch(this.statusActions.updateNetStatus(false));
      if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate(['signIn']);
    }
  }

  getSocketId(): string {
    return this.socket.id;
  }

  closeConnection(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.store.dispatch(this.statusActions.clearStatus());
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
