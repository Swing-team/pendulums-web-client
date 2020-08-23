import * as _ from 'lodash';
import * as moment from 'moment';
import { Component, Input, OnInit,
  Output, EventEmitter }                    from '@angular/core';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { ActivityService } from 'app/core/services/activity.service';
import { ModalService } from 'app/core/modal/modal.service';
import { ErrorService } from 'app/core/error/error.service';

@Component({
  selector: 'create-activity',
  templateUrl: './activity-add-edit-manually.component.html',
  styleUrls: ['./activity-add-edit-manually.component.sass']
})
export class AddManuallyActivityComponent implements OnInit {
  @Output() responseActivity = new EventEmitter();
  @Input() currentActivity: Activity;
  @Input() activity: Activity;
  @Input() projectId: string;
  saveButtonDisabled = false;
  activityModel: Activity;
  fromCalenderShow = false;
  toCalenderShow = false;

  toTimeError = false;
  fromTimeError = false;
  timeError: string;

  fromCalenderError = false;
  toCalenderError = false;
  dateError: string;

  toDate: string;
  toDateValue: string;
  toTime: string;

  fromDate: string;
  fromDateValue: string;
  fromTime: string;

  constructor (private activityService: ActivityService,
               private modalService: ModalService,
               private errorService: ErrorService) {}

  ngOnInit() {
    if (this.activity) {
      this.activityModel = _.cloneDeep(this.activity);
      this.activityModel.name = this.activityModel.name.trim();
      this.fromDate = moment(Number(this.activityModel.startedAt)).format('dddd, MMMM Do YYYY');
      this.fromDateValue = this.activityModel.startedAt;
      this.toDate = moment(Number(this.activityModel.stoppedAt)).format('dddd, MMMM Do YYYY');
      this.toDateValue = this.activityModel.stoppedAt;
      this.fromTime = moment(Number(this.activityModel.startedAt)).format('HH:mm');
      this.toTime = moment(Number(this.activityModel.stoppedAt)).format('HH:mm');
    } else {
      this.activityModel = {} as Activity;
      this.fromDate = moment().format('dddd, MMMM Do YYYY');
      this.toDate = moment().format('dddd, MMMM Do YYYY');

      this.fromTime = moment().subtract(2, 'hours').format('HH:mm');
      this.toTime = moment().format('HH:mm');

      this.fromDateValue = moment().valueOf().toString();
      this.toDateValue = moment().subtract(2, 'hours').valueOf().toString();
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
      this.timeError = 'End time could not be before start time';
    } else {
      this.fromTimeError = false;
    }
  }

  updateFromTime() {
    this.fromTimeError = this.checkTime();
    if (this.fromTimeError) {
      this.timeError = 'Start time could not be after end time';
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
    this.toDateValue = event.valueOf().toString();
    this.toCalenderError = this.checkDate();
    if (this.toCalenderError) {
      this.dateError = 'The end date could not be before start date';
    } else {
      this.fromCalenderError = false;
    }
    this.toCalenderShow = false;
  }

  updateFromDate(event) {
    this.fromDate = event.format('dddd, MMMM Do YYYY');
    this.fromDateValue = event.valueOf().toString();
    this.fromCalenderError = this.checkDate();
    if (this.fromCalenderError) {
      this.dateError = 'The start date could not be after end date';
    } else {
      this.toCalenderError = false;
    }
    this.fromCalenderShow = false;
  }

  checkDate(): boolean {
    if (this.fromDate && this.toDate) {
      const tempFromDate = moment(this.fromDate, 'dddd, MMMM Do YYYY').startOf('day');
      const tempToDate = moment(this.toDate, 'dddd, MMMM Do YYYY').startOf('day');

      // anyway timeCheck should run to check times are ok or not
      const tempCheck = this.checkTime();
      this.fromTimeError = tempCheck;
      this.toTimeError = tempCheck;
      if (tempCheck) {
        this.timeError = 'Please check chosen times';
      }

      if (tempToDate.isBefore(tempFromDate)) {
        return true;
      }
    }
    return false;
  }

  addActivity() {
    const validation = this.validateForm();
    let message = '';
    if (validation) {
      if (!this.saveButtonDisabled) {
        this.saveButtonDisabled = true;
        const dividedActivitiesArray = [];
        const stoppedAtDay = moment(Number(this.activityModel.stoppedAt)).startOf('day');
        const startedAtDay = moment(Number(this.activityModel.startedAt)).startOf('day');
        if (stoppedAtDay.isSame(startedAtDay)) {
          // nothing to do
        } else {
          const diff = stoppedAtDay.diff(startedAtDay, 'days');
          const tempStoppedAt = this.activityModel.stoppedAt;
          let startedAt = this.activityModel.startedAt;
          let stoppedAt = moment(Number(this.activityModel.startedAt)).endOf('day').valueOf();
          this.activityModel.stoppedAt = stoppedAt.toString();
          for (let i = 0; i < diff; i++) {
            startedAt = (stoppedAt + 1).toString();
            if (i < diff - 1) {
              stoppedAt = moment(stoppedAt + 1).endOf('day').valueOf();
            } else if (i === diff - 1) {
              stoppedAt = Number(tempStoppedAt);
            }
            const tempResult = {
              name: this.activityModel.name.trim(),
              user: this.activityModel.user,
              project: this.activityModel.project,
              startedAt: startedAt,
              stoppedAt: stoppedAt.toString(),
            };
            dividedActivitiesArray.push(tempResult);
          }
        }

        if (this.activity) {
          this.activityService.editOldActivity(this.projectId, this.activityModel).then((activity) => {
            message = 'The activity was edited successfully';
            this.pushDividedActivitiesToServer(dividedActivitiesArray, message, activity);
          })
            .catch(error => {
              this.showError('Server error!');
              console.log('error is: ', error);
            });
        } else {
          dividedActivitiesArray.push(this.activityModel);
          message = 'The activity was created successfully';
          this.pushDividedActivitiesToServer(dividedActivitiesArray, message);
        }
      }
    }
  }

  pushDividedActivitiesToServer (dividedActivitiesResult, message, editedActivity?) {
    const promises = [];
    const result = [];
    dividedActivitiesResult.map((item) => {
      promises.push(this.activityService.createManually(this.projectId, item).then((activity) => {
        result.push(activity);
      })
        .catch(error => {
          this.showError('Server error!');
          console.log('server error', error);
        }));
    });

    Promise.all(promises).then(value => {
      if (editedActivity) {
        result.push(editedActivity);
      }
      this.showError(message);
      this.responseActivity.emit(result);
      this.modalService.close();
    });
  }

  validateForm(): boolean {
    let finalCheck = true ;
    if (this.IsNullOrWhiteSpace(this.activityModel.name)) {
      this.activityModel.name = 'Untitled Activity';
    }
    this.activityModel.name = this.activityModel.name.trim();
    if (this.fromDate && this.toDate) {
      const tempCheck = this.checkDate();
      if (tempCheck) {
        finalCheck = false;
        this.toCalenderError = tempCheck;
        this.fromCalenderError = tempCheck;
        this.dateError = 'Please check chosen dates';
      }
      if (this.toTimeError || this.toTimeError) {
        finalCheck = false;
        this.timeError = 'Please check chosen times';
      }
    }
    if (!this.fromDate || !this.toDate) {
      this.fromCalenderError = !this.fromDate;
      this.toCalenderError = !this.toDate;
      this.dateError = 'Please choose a date';
      finalCheck = false;
    }
    if (!this.fromTime || !this.toTime) {
      this.fromTimeError = !this.fromTime;
      this.toTimeError = !this.toTime;
      this.timeError = 'Please choose a time';
      finalCheck = false;
    }
    if (finalCheck) {
      const now = moment().valueOf();
      const fromTimeArray = this.fromTime.split(':');
      const toTimeArray = this.toTime.split(':');
      const tempFromDate = moment(this.fromDate, 'dddd, MMMM Do YYYY').hours(Number(fromTimeArray[0]))
        .minutes(Number(fromTimeArray[1])).seconds(0).valueOf();
      const tempToDate = moment(this.toDate, 'dddd, MMMM Do YYYY').hours(Number(toTimeArray[0]))
        .minutes(Number(toTimeArray[1])).seconds(0).valueOf();
      if (now < tempFromDate) {
        finalCheck = false;
        this.showError('The start time could not be after now');
      }
      if (now < tempToDate) {
        finalCheck = false;
        this.showError('The end time could not be after now');
      }
      if (this.currentActivity) {
        if (this.currentActivity.startedAt) {
          if (Number(this.currentActivity.startedAt) < tempFromDate) {
            finalCheck = false;
            this.showError('The start time could not be after start time of current activity');
          }
          if (Number(this.currentActivity.startedAt) < tempToDate) {
            finalCheck = false;
            this.showError('The end time could not be after start time of current activity');
          }
        }
      }
      this.activityModel.startedAt = tempFromDate.toString();
      this.activityModel.stoppedAt = tempToDate.toString();
    }
    return finalCheck;
  }

  IsNullOrWhiteSpace(value: string): boolean {
    if (value == null || value === 'undefined') {
      return true;
    }
    return value.toString().replace(/\s/g, '').length < 1;
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}


