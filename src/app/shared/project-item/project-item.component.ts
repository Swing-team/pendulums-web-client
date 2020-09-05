import {
  Component, Inject, Input,
  OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Store }                              from '@ngrx/store';
import { Observable ,  Subscription }         from 'rxjs';
import { Router }                             from '@angular/router';
import { Md5 }                                from 'ts-md5/dist/md5';
import { cloneDeep }                          from 'lodash';
import { Project } from 'app/shared/state/project/project.model';
import { User } from 'app/shared/state/user/user.model';
import { Status } from 'app/shared/state/status/status.model';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { environment } from 'environments/environment';
import { AppState } from 'app/shared/state/appState';
import { ModalService } from 'app/core/modal/modal.service';
import { ErrorService } from 'app/core/error/error.service';
import { StopStartActivityService } from 'app/core/services/stop-start-activity.service';
import { userInProject } from 'app/utils/project.util';
import { ProjectSettingsModalComponent } from 'app/project/settings/modal/project-settings-modal.component';

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
  @Input() dividerLine: boolean;
  @Input() isEditable: boolean = false;
  @Input() currentActivities: Activity[] = [];
  @ViewChild('activityNameElm') activityNameElm;
  activityStarted = false;
  activityButtonDisabled = false;
  showMore = false;
  showMoreStart: number;
  showMoreEnd: number;
  environment = environment;

  private currentActivityCopy: Activity;
  taskName: string;
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
    if (this.currentActivity && !this.isEditable) {
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
    this.activity = {} as Activity;
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
      // HACK: make a clone of project because we change it settings and dispatch it.
      const project = cloneDeep(this.project);
      this.modalService.show({
        component: ProjectSettingsModalComponent,
        inputs: {
          project,
          user: this.user,
          projectIdInCurrentActivity: this.currentActivityCopy ? this.currentActivityCopy.project : null
        }
      });
    } else {
      this.showError('Not available in offline mode');
    }
  }
  goToProjectDashboard(): void {
    if (!this.isEditable) {
      if (this.status.netStatus) {
        this.router.navigate(['/projects', this.project.id]);
      } else {
        this.showError('Not available in offline mode');
      }
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}