import {
  Component, Inject, Input,
  OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Project }                            from '../../../../shared/state/project/project.model';
import { Store }                              from '@ngrx/store';
import { AppState }                           from '../../../../shared/state/appState';
import { Observable }                         from 'rxjs/Observable';
import { Activity }                           from '../../../../shared/state/current-activity/current-activity.model';
import { ModalService }                       from '../../../../core/modal/modal.service';
import { ProjectSettingsModalComponent }      from 'app/dashboard/projects/settings/modal/project-settings-modal.component';
import { User }                               from '../../../../shared/state/user/user.model';
import { Router }                             from '@angular/router';
import { ErrorService }                       from '../../../../core/error/error.service';
import { Status }                             from '../../../../shared/state/status/status.model';
import { Md5 }                                from 'ts-md5/dist/md5';
import { Subscription }                       from 'rxjs/Subscription';
import { StopStartActivityService }           from '../../../../core/services/stop-start-activity.service';
import { userInProject }                      from '../../../shared/utils';
import { environment }                        from '../../../../../environments/environment';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass']
})
export class ProjectItemComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  @Input() user: User;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;
  @ViewChild('activityNameElm') activityNameElm;
  activityStarted = false;
  activityButtonDisabled = false;
  showMore = false;
  showMoreStart: number;
  showMoreEnd: number;
  environment = environment;

  private currentActivityCopy: Activity;
  private taskName: string;
  private activity: Activity;
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>,
               private router: Router,
               private modalService: ModalService,
               private errorService: ErrorService,
               private stopStartActivityService: StopStartActivityService) {
  }

  ngOnInit() {
    this.taskName = this.project.recentActivityName;
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe((currentActivity) => {
        if (currentActivity.project === this.project.id) {
          this.activityStarted = true;

          // this part of code is to handel situation that we have slow connection and activityName is editing
          if (this.activityNameElm && document.activeElement === this.activityNameElm.nativeElement) {
            // do nothing
          } else {
            this.taskName = currentActivity.name;
          }
        } else {
          this.activityStarted = false;
        }
        this.currentActivityCopy = currentActivity;
      }));
    }

    this.initializePointers();
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  toggleStopStart() {
    if (!this.activityButtonDisabled) {
      this.activityButtonDisabled = true;
      if (this.activityStarted) {
        this.stopActivity();
      } else {
        this.startActivity();
      }
    }
  }

  startActivity() {
    if (!this.taskName) {
      this.taskName = 'Untitled Activity';
    }
    this.activity = new Activity();
    this.activity.name = this.taskName;
    this.activity.startedAt = Date.now().toString();
    // we need two below fields for offline logic
    this.activity.project = this.project.id;

    this.stopStartActivityService.startActivity(this.activity, this.project).then(() => {
      this.activityButtonDisabled = false;
      this.showError('The activity was started');
    });

    // This timeout use to handle focus on input
    setTimeout(() => {
      if (this.activityNameElm) {
        this.activityNameElm.nativeElement.focus();
        this.activityNameElm.nativeElement.select();
      }
    }, 500)
  }

  stopActivity() {
    this.stopStartActivityService.stopActivity(this.project).then(() => {
      this.activityButtonDisabled = false;
      this.showError('The activity was stopped');
    });
  }

  nameActivity($event) {
    this.taskName = this.taskName.trim();
    this.stopStartActivityService.nameActivity(this.taskName, this.project);
    // just for blur out the input
    const target = $event.target;
    target.blur();
  }

  calculateActivityDuration (activity) {
    let hour = 'Due';
    if (activity.stoppedAt) {
      const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
      let x = duration / 1000;
      const seconds = Math.floor(x % 60);
      // minutes
      x /= 60;
      const minutes = Math.floor(x % 60);
      // hours
      x /= 60;
      const hours = Math.floor(x);

      if (hours !== 0) {
        hour = hours + 'h ' + minutes + 'm';
      }

      if (minutes !== 0 && hours === 0) {
        hour = minutes + ' min' ;
      }

      if (minutes === 0 && hours === 0) {
        hour = seconds + ' sec';
      }
    } else if (!activity.startedAt) {
      hour = '- -'
    }
    return hour;
  };

  findUserInProject(userId) {
    const user = userInProject(this.project, userId);
    return user;
  }

  findUserName(userId) {
    const user = this.findUserInProject(userId);
    const userName = user.name ? user.name : user.email;
    return userName;
  }

  findUserImage(userId) {
    const user = this.findUserInProject(userId);
    const imgUrl = user.profileImage ? environment.imagesEndpoint + '/profile/' + user.profileImage : '';
    return imgUrl;
  }

  getUserEmailHash(userId): any {
    const user = this.findUserInProject(userId);
    return Md5.hashStr(user.email);
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.initializePointers();
  }

  initializePointers() {
    this.showMoreStart = 0;
    this.showMoreEnd = 5;
    if (this.project.activities.length > 5) {
      this.showMoreEnd = 5;
    } else {
      this.showMoreEnd = this.project.activities.length;
    }
  }

  increasePointer() {
    this.showMoreStart = this.showMoreStart + 5;
    this.showMoreEnd = this.showMoreEnd + 5;
  }

  decreasePointer() {
    this.showMoreStart = this.showMoreStart - 5;
    this.showMoreEnd = this.showMoreEnd - 5;
  }

  showSettings() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: ProjectSettingsModalComponent,
        inputs: {
          project: this.project,
          user: this.user,
          projectIdInCurrentActivity: this.currentActivityCopy.project
        }
      });
    } else {
      this.showError('Not available in offline mode');
    }
  }

  goToActivities(): void {
    if (this.status.netStatus) {
      this.router.navigate(['/activities', this.project.id]);
    } else {
      this.showError('Not available in offline mode');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
