import 'rxjs/add/operator/switchMap';
import { Component, Input,
         OnChanges, SimpleChange }          from '@angular/core';
import { Md5 }                              from 'ts-md5';
import { environment }                      from '../../../../../../environments/environment';

@Component({
  selector: 'chart-total-hour',
  templateUrl: './chart-total-hour.component.html',
  styleUrls: ['./chart-total-hour.component.sass']
})

export class ChartTotalHourComponent implements OnChanges {
  @Input() inputArray: Array<{
    disabled: any,
    userName: any,
    email: string;
    userId: any,
    totalHoursPerUser: number,
    humanizedHour: string,
    profileImage: string
  }> = [];
  totalHours = 0;
  result = '';
  environment = environment;

  constructor() {}

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.inputArray.currentValue || changes.inputArray.firstChange) {
      this.calculateTotalHours();
    }
  }

  calculateTotalHours () {
    this.totalHours = 0;
    this.inputArray.map((data) => {
      if (!data.disabled) {
        this.totalHours = this.totalHours + data.totalHoursPerUser;
        data.humanizedHour = this.humanizeHours(data.totalHoursPerUser)
      }
    });
    this.result = this.humanizeHours(this.totalHours);
  }

  humanizeHours (time) {
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

  getEmailHash(email): any {
    return Md5.hashStr(email);
  }
}


