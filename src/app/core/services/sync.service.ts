import 'rxjs/add/operator/toPromise';
import { Injectable }                   from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../../shared/state/appState';
import { StatusActions }                from '../../shared/state/status/status.actions';
import { DatabaseService }              from './database/database.service';
import { UserActions }                  from '../../shared/state/user/user.actions';
import { ProjectsActions }              from '../../shared/state/project/projects.actions';
import { CurrentActivityActions }       from '../../shared/state/current-activity/current-activity.actions';
import { UnSyncedActivityActions }      from 'app/shared/state/unsynced-activities/unsynced-activities.actions';
import { UserService }                  from './user.service';
import { Observable }                   from 'rxjs/Observable';
import { Status }                       from '../../shared/state/status/status.model';
import { environment }                  from '../../../environments/environment';
import { SocketService }                from './socket.service';
import { NotesActions }                 from 'app/shared/state/note/notes.actions';
import { ThemeActions }                 from 'app/shared/state/theme/theme.actions';

@Injectable()
export class SyncService {
  private options: any;
  private tempState: any;
  private status: Observable<any>;
  private currentActivity: Observable<any>;
  private currentActivityProjectId: string;
  private isLogin: boolean;
  private responseResults: Promise<any>[] = [];

  constructor(private http: HttpClient,
              private userService: UserService,
              private store: Store<AppState>,
              private statusActions: StatusActions,
              private dBService: DatabaseService,
              private userActions: UserActions,
              private projectsActions: ProjectsActions,
              private currentActivityActions: CurrentActivityActions,
              private unSyncedActivityActions: UnSyncedActivityActions,
              private notesActions: NotesActions,
              private themeActions: ThemeActions,
              private socketService: SocketService) {
    this.status = store.select('status');
    this.currentActivity = store.select('currentActivity');

    this.status.subscribe((status: Status) => {
      this.isLogin = status.isLogin;
    });

    this.currentActivity.subscribe((currentActivity) => {
      this.currentActivityProjectId = currentActivity.project;
    });

    this.socketService.socketConnected$.subscribe(() => {
      this.getStateFromDb().then(() => {
        this.autoSync();
      }).catch(() => {
        this.getSummaryOnline();
      });
    })

    this.socketService.messages$.subscribe((data) => {
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

    this.options = {...environment.httpOptions, responseType: 'text'}
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
      .put(environment.apiEndpoint + '/sync/activities' + '?socketId=' + this.socketService.getSocketId()
      , JSON.stringify(data), this.options)
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
          if ((data.length > 0) && (data[0].data) && (data[0].data.length > 0)) {
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

  private connectSocket() {
    this.socketService.connectSocket();
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
      })
      .catch(error => {
        if (error.status === 404) {
          this.dBService
          .removeAll('activeUser')
          .then(() => {
            this.store.dispatch(this.statusActions.updateStatus({netStatus: true, isLogin: false}));
          });
        }
        if (error.status !== 403) {
          this.initialAppOffline();
        }
      }));
  }

  initialAppOffline() {
    if (this.tempState) {
      this.store.dispatch(this.userActions.loadUser(this.tempState.user));
      this.store.dispatch(this.projectsActions.loadDbProjects(this.tempState.projects));
      this.store.dispatch(this.notesActions.loadDbNotes(this.tempState.notes));
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(this.tempState.currentActivity));
      this.store.dispatch(this.unSyncedActivityActions.loadUnSyncedActivity(this.tempState.unSyncedActivity));
      this.store.dispatch(this.themeActions.loadTheme(this.tempState.theme));
      this.store.dispatch(this.statusActions.updateStatus({netStatus: false, isLogin: true}));
    } else {
      this.store.dispatch(this.statusActions.updateStatus({isLogin: null}));
    }
  }

  closeConnection(): void {
    this.socketService.closeConnection();
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
