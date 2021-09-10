import {
  Component, EventEmitter,
  Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewContainerRef
} from '@angular/core';
import { trigger, style, transition, animate }  from '@angular/animations';
import { userInProject }                        from 'app/utils/project.util';
import { Md5 }                                  from 'ts-md5/dist/md5';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { Project } from 'app/shared/state/project/project.model';
import { User } from 'app/shared/state/user/user.model';
import { environment } from 'environments/environment';
import { TeamMember } from '../state/team-member/team-member.model';

@Component({
  selector: 'activity-item',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)', opacity: 0}),
        animate('200ms ease-out', style({transform: 'translateY(0%)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({transform: 'translateY(-100%)', opacity: 0}))
      ])
    ])
  ],
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.sass']
})
export class ActivityItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activity: Activity;
  @Input() project: Project;
  @Input() currentUser: User;
  @Input() deleteButtonDisabled: boolean;
  @Output() onDeleteClicked = new EventEmitter();
  @Output() onEditClicked = new EventEmitter();
  from: string;
  to: string;
  duration: string;
  showDeleteConfirmation = false;
  activityUser: TeamMember;
  environment = environment;
  activityTimeInterval: any;

  constructor (private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    if (this.activity.stoppedAt) {
      this.initialize();
    } else {
      const fromDate = new Date(Number(this.activity.startedAt));
      this.from = fromDate.getHours() + ':' + fromDate.getMinutes();
      this.to = '...';
      this.activityTimeInterval = setInterval(() => {
        let startedAt = Number(this.activity.startedAt);
        let now = Date.now();
        let duration = now - startedAt;
        this.duration = this.calculateActivityDuration(duration);
      }, 1000);
    }
    this.activityUser = userInProject(this.project, this.activity.user);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activity && changes.activity.currentValue.stoppedAt && this.activityTimeInterval) {
      clearInterval(this.activityTimeInterval);
      this.initialize();
    }
  }

  private initialize() {
    const fromDate = new Date(Number(this.activity.startedAt));
    this.from = ('0' + fromDate.getHours()).slice(-2)   + ':' + ('0' + fromDate.getMinutes()).slice(-2);
    const toDate = new Date(Number(this.activity.stoppedAt));
    this.to = ('0' + toDate.getHours()).slice(-2)   + ':' + ('0' + toDate.getMinutes()).slice(-2);
    const tempDuration = Number(this.activity.stoppedAt) - Number(this.activity.startedAt);
    this.duration = this.calculateActivityDuration(tempDuration);
  }

  delete() {
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (!this.deleteButtonDisabled) {
      this.onDeleteClicked.emit();
    }
  }

  cancelDelete() {
    if (!this.deleteButtonDisabled) {
      this.showDeleteConfirmation = false;
    }
  }

  openEditManuallyModal() {
    this.onEditClicked.emit();
  }

  getEmailHash(email): any {
    return Md5.hashStr(email);
  }

  calculateActivityDuration (duration) {
    let result: string;
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    if (hours !== 0) {
      result = hours + 'h ' + minutes + 'min';
    }

    if (minutes !== 0 && hours === 0) {
      result = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  }

  ngOnDestroy(): void {
    if (this.activityTimeInterval) {
      clearInterval(this.activityTimeInterval);
    }
  }
}


