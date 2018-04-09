import 'rxjs/add/operator/switchMap';
import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';

@Component({
  selector: 'chart-total-hour',
  templateUrl: './chart-total-hour.component.html',
  styleUrls: ['./chart-total-hour.component.sass']
})

export class ChartTotalHourComponent implements OnChanges {
  @Input() inputArray: Array<{
    disabled: any,
    userName: any
    userId: any
    totalHoursPerUser: number
  }> = [];
  totalHours = 0;

  constructor() {
  }

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
      }
    })
  }
}
