import {
  Component, EventEmitter,
  Inject, Input, OnInit, Output, ViewContainerRef
} from '@angular/core';
import { APP_CONFIG }                      from '../../../../app.config';
import { Activity }                        from '../../../../shared/state/current-activity/current-activity.model';
import { ModalService }                    from '../../../../core/modal/modal.service';
import { AddManuallyActivityComponent }    from '../../activity-add-edit-manually/activity-add-edit-manually.component';

@Component({
  selector: 'activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.sass']
})
export class ActivityItemComponent implements OnInit {
  @Input() activity: Activity;
  @Output() onDeleteClicked = new EventEmitter();
  private from: string;
  private to: string;
  private duration: string;
  private deleteConfirmation = false;

  constructor (@Inject(APP_CONFIG) private config,
               private modalService: ModalService,
               private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.initial();
  }

  initial() {
    const fromDate = new Date(Number(this.activity.startedAt));
    this.from = fromDate.getHours() + ':' + fromDate.getMinutes();
    const toDate = new Date(Number(this.activity.stoppedAt));
    this.to = toDate.getHours() + ':' + toDate.getMinutes();
    this.duration = this.calculateActivityDuration(this.activity);
  }

  delete() {
    this.deleteConfirmation = true;
    console.log(this.deleteConfirmation)
  }

  confirmDelete() {
    this.onDeleteClicked.emit();
  }

  cancelDelete() {
    this.deleteConfirmation = false;
  }

  updateActivity(param) {
    this.activity = param;
    this.initial();
  }

  openEditManuallyModal() {
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        activity: this.activity,
        projectId: this.activity.project,
      },
      outputs: {
        responseActivity: (param) => {
          this.updateActivity(param);
        }
      },
      customStyles: {'width': '400px', 'overflow': 'initial'}
    });
  }

  calculateActivityDuration (activity) {
    const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
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
      if (minutes < 10) {
        result = hours + ':0' + minutes ;
      } else {
        result = hours + ':' + minutes ;
      }
    }

    if (minutes !== 0 && hours === 0) {
      result = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  };

}


