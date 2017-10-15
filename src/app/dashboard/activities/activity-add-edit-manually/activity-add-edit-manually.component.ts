import * as _ from 'lodash';
import * as moment from 'moment';
import { Component, Inject, Input, OnInit,
  Output, EventEmitter }                    from '@angular/core';
import { APP_CONFIG }                       from '../../../app.config';
import { Activity }                         from '../../../shared/state/current-activity/current-activity.model';
import { ActivityService }                  from '../../../shared/activity/activity.service';
import { ModalService }                     from '../../../core/modal/modal.service';
import { ErrorService }                     from '../../../core/error/error.service';

@Component({
  selector: 'create-activity',
  templateUrl: './activity-add-edit-manually.component.html',
  styleUrls: ['./activity-add-edit-manually.component.sass']
})
export class AddManuallyActivityComponent implements OnInit {
  @Output() responseActivity = new EventEmitter();
  @Input() activity: Activity;
  @Input() projectId: string;
  private activityModel: Activity;
  private fromCalenderShow = false;
  private toCalenderShow = false;

  private toTimeError = false;
  private fromTimeError = false;
  private timeError: string;

  private fromCalenderError = false;
  private toCalenderError = false;
  private dateError: string;

  private toDate: string;
  private toTime: string;

  private fromDate: string;
  private fromTime: string;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private modalService: ModalService,
               private errorService: ErrorService) {}

  ngOnInit() {
    if (this.activity) {
      this.activityModel = _.cloneDeep(this.activity);
      this.fromDate = moment(Number(this.activityModel.startedAt)).format('dddd, MMMM Do YYYY');
      this.toDate = moment(Number(this.activityModel.stoppedAt)).format('dddd, MMMM Do YYYY');
      this.fromTime = moment(Number(this.activityModel.startedAt)).format('HH:mm');
      this.toTime = moment(Number(this.activityModel.stoppedAt)).format('HH:mm');
    } else {
      this.activityModel = new Activity();
    }
  }

  showFromCalender() {
    this.fromCalenderShow = true;
  }

  closeFromCalender() {
    this.fromCalenderShow = false;
  }

  showToCalender() {
    this.toCalenderShow = true;
  }

  closeToCalender() {
    this.toCalenderShow = false;
  }

  updateToTime() {
    this.toTimeError = this.checkTime();
    if (this.toTimeError) {
      this.timeError = 'To cant be before From';
    } else {
      this.fromTimeError = false;
    }
  }

  updateFromTime() {
    this.fromTimeError = this.checkTime();
    if (this.fromTimeError) {
      this.timeError = 'From cant be after To';
    } else {
      this.toTimeError = false;
    }
  }

  checkTime(): boolean {
    if (this.fromTime && this.toTime) {
      if (this.fromDate && this.toDate) {
        const tempFromDate = moment(this.fromDate, 'dddd, MMMM Do YYYY').hours(0).minutes(0).seconds(0);
        const tempToDate = moment(this.toDate, 'dddd, MMMM Do YYYY').hours(0).minutes(0).seconds(0);
        if (tempToDate.isSame(tempFromDate)) {
          const fromTimeArray = this.fromTime.split(':');
          const toTimeArray = this.toTime.split(':');
          if (Number(fromTimeArray[0]) > Number(toTimeArray[0])) {
            console.log('invalid time error.');
            return true;
          }
          if (Number(fromTimeArray[0]) === Number(toTimeArray[0])) {
            if (Number(fromTimeArray[1]) >= Number(toTimeArray[1])) {
              console.log('invalid time error.');
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  updateToDate(event) {
    this.toDate = event.format('dddd, MMMM Do YYYY');
    this.toCalenderError = this.checkDate();
    if (this.toCalenderError) {
      this.dateError = 'selected date is before From';
      console.log('you cant select date before From date.');
    } else {
      this.fromCalenderError = false;
    }
    this.toCalenderShow = false;
  }

  updateFromDate(event) {
    this.fromDate = event.format('dddd, MMMM Do YYYY');
    this.fromCalenderError = this.checkDate();
    if (this.fromCalenderError) {
      this.dateError = 'selected date is after To';
      console.log('you cant select date after To date.');
    } else {
      this.toCalenderError = false;
    }
    this.fromCalenderShow = false;
  }

  checkDate(): boolean {
    if (this.fromDate && this.toDate) {
      const tempFromDate = moment(this.fromDate, 'dddd, MMMM Do YYYY').hours(0).minutes(0).seconds(0);
      const tempToDate = moment(this.toDate, 'dddd, MMMM Do YYYY').hours(0).minutes(0).seconds(0);

      // anyway timeCheck should run to check times are ok or not
      const tempCheck = this.checkTime()
      this.fromTimeError = tempCheck;
      this.toTimeError = tempCheck;
      if (tempCheck) {
        this.timeError = 'check times again';
      }

      if (tempToDate.isBefore(tempFromDate)) {
        console.log('selected date is invalid.');
        return true;
      }
    }
    return false;
  }

  addActivity() {
    const validation = this.validateForm();
    if (validation) {
      const fromTimeArray = this.fromTime.split(':');
      const toTimeArray = this.toTime.split(':');
      const tempFromDate = moment(this.fromDate, 'dddd, MMMM Do YYYY').hours(Number(fromTimeArray[0]))
                           .minutes(Number(fromTimeArray[1])).seconds(0).valueOf();
      const tempToDate = moment(this.toDate, 'dddd, MMMM Do YYYY').hours(Number(toTimeArray[0]))
                           .minutes(Number(toTimeArray[1])).seconds(0).valueOf();
      this.activityModel.startedAt = tempFromDate.toString();
      this.activityModel.stoppedAt = tempToDate.toString();
      if (this.activity) {
        this.activityService.editOldActivity(this.projectId,  this.activityModel).then((activity) => {
          this.showError('Activity edited successfully');
          console.log('Activity edited successfully');
          this.responseActivity.emit(activity);
          this.modalService.close();
        })
          .catch(error => {
            this.showError('Server error happened.');
            console.log('error is: ', error);
          });
      } else {
        this.activityService.create(this.projectId,  this.activityModel).then((activity) => {
          this.showError('Activity added successfully');
          console.log('Activity added successfully');
          this.responseActivity.emit(activity);
          this.modalService.close();
        })
          .catch(error => {
            this.showError('Server error happened.');
            console.log('error is: ', error);
          });
      }

    }
  }

  validateForm(): boolean {
    let finalCheck = true ;
    if (/\s/g.test(this.activityModel.name) || !this.activityModel.name) {
      this.activityModel.name = 'Untitled name';
    }
    if (this.fromDate && this.toDate) {
      const tempCheck = this.checkDate();
      if (tempCheck) {
        finalCheck = false;
        this.toCalenderError = tempCheck;
        this.fromCalenderError = tempCheck;
        this.dateError = 'Dates have conflict.';
      }
      if (this.toTimeError || this.toTimeError) {
        finalCheck = false;
        this.timeError = 'check times again';
      }
    }
    if (!this.fromDate || !this.toDate) {
      this.fromCalenderError = !this.fromDate;
      this.toCalenderError = !this.toDate;
      this.dateError = 'Specify this date.';
      finalCheck = false;
    }
    if (!this.fromTime || !this.toTime) {
      this.fromTimeError = !this.fromTime;
      this.toTimeError = !this.toTime;
      this.timeError = 'Specify this time.';
      finalCheck = false;
    }
    return finalCheck;
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}


