import { Component, OnChanges, Input,
  EventEmitter, OnInit, Output }          from '@angular/core';
import * as moment                        from 'moment';

@Component({
  selector: 'swing-calendar',
  templateUrl: './swing-calendar.component.html',
  styleUrls: ['./swing-calendar.component.sass'],
})

export class SwingCalendarComponent implements OnChanges, OnInit {

  @Input() minDate: string;
  @Input() maxDate: string;
  @Input() disableDays = [];
  @Input() toContainPrevMonth = true;
  @Input() toContainNextMonth = true;
  // value is used when we have input date
  @Input() value = '';
  @Output() dateSelected = new EventEmitter();
  // below fields are needed in html UI
  private currDate = moment();
  daysOfWeek = [ 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
  private months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private completeDates: any;
  private tempArray: any;
  private prevMonth: string;
  private nextMonth: string
  private prevYear: number;
  private nextYear: number;
  currMonth: string;
  currYear: number;
  dates: any = [];

  constructor( ) {
  }

  ngOnInit() {
    this.currMonth = this.months[new Date().getMonth()].toString();
    this.currYear = new Date().getFullYear();
    // Set previous and next months
    this.prevMonth = this.months[new Date().getMonth() - 1].toString();
    this.nextMonth = this.months[new Date().getMonth() + 1].toString();
    this.prevYear = (this.currYear - 1);
    this.nextYear = (this.currYear + 1);
    // Set Date Array
    if (this.value !== '') {
      const givenDate = moment(this.value, 'MM/DD/YYYY', true);
      this.currMonth = this.months[givenDate.month()].toString();
      this.currYear = givenDate.year();
      this.dates = this.setDateArray(this.currMonth, this.currYear, givenDate.date());
    } else {
      this.dates = this.setDateArray(this.currMonth, this.currYear, '');
    }
  }

  ngOnChanges() {

  }

  setPrevMonth() {
    this.nextMonth = this.currMonth;
    this.currMonth = this.prevMonth;
     // Set new previous month
    const tempDate = new Date(this.currMonth + '/' + '1' + '/' + this.currYear);
    if (this.currMonth === 'Jan') {
       // Set previous month to December
      this.prevMonth = this.months[11].toString();
    } else {
      this.prevMonth = this.months[tempDate.getMonth() - 1].toString();
    }
    if (this.currMonth === 'Dec') {
       // Set current year to previous year
      this.currYear = this.prevYear;
      this.prevYear = (this.currYear - 1);
      this.nextYear = (this.currYear + 1);
    }
     // Set Date Array to previous month
    this.dates = this.setDateArray(this.currMonth, this.currYear, '');
  }

  setNextMonth() {
    this.prevMonth = this.currMonth;
    this.currMonth = this.nextMonth;
     // Set new next month
    const tempDate = new Date(this.currMonth + '/' + '1' + '/' + this.currYear);
    if (this.currMonth === 'Dec') {
       // Set next month to January
      this.nextMonth = this.months[0].toString();
    } else {
      this.nextMonth = this.months[tempDate.getMonth() + 1].toString();
    }
    if (this.currMonth === 'Jan') {
       // Set current year to previous year
      this.currYear = this.nextYear;
      this.prevYear = (this.currYear - 1);
      this.nextYear = (this.currYear + 1);
    }
     // Set Date Array to next month
    this.dates = this.setDateArray(this.currMonth, this.currYear, '');
  }

  setDateArray(month, year, date): any {

    const tempLastDate = this.decideDate(month, year);
    const temp = [];
    for (let i = 1; i <= tempLastDate; i++) {
      const currentDate = moment().year(year).month(month).date(i);
      let dbld = false;
      // To disable Days - Index based 0-6
      for (let dayIndex = 0; dayIndex < this.disableDays.length; dayIndex++) {
        if (currentDate.day() === this.disableDays[dayIndex]) {
          dbld = true;
        }
      }
      // To determine minDate and maxDate
      if (this.minDate && currentDate.isBefore(this.minDate)) {
        dbld = true;
      }
      if (this.maxDate && currentDate.isAfter(moment(this.maxDate).add(1, 'd'))) {
        dbld = true;
      }
      if (i !== date) {
        temp.push({
          'month': this.months.indexOf(month) + 1,
          'date': i,
          'disabled': dbld,
          'selected': false,
          'empty': false,
          'year': this.currYear
        });
      } else {
        temp.push({
          'month': this.months.indexOf(month) + 1,
          'date': i,
          'disabled': dbld,
          'selected': true,
          'empty': false,
          'year': this.currYear
        });
      }
    }
    this.completeDates = temp;

    // Determine Date of First of the Month
    const firstDate = new Date(`${year}-${this.months.indexOf(month) + 1}-1`);
    const lastDate = new Date(`${year}-${this.months.indexOf(month) + 1}-${tempLastDate}`);

    // Prepend Prev Month Dates
    const spaceArray = [];
    if (firstDate.getDay() !== 6) {
      // Not Saturday
      const pMonth = this.months.indexOf(month) - 1;
      let prevLast = this.decideDate(this.months[pMonth], year);
      // Fix it to display last date last
      for (let i = -1; i < firstDate.getDay(); i++) {
        if (this.toContainPrevMonth) {
          spaceArray.push({
            'month': this.months.indexOf(month),
            'date': prevLast,
            'disabled': true,
            'selected': false,
            'empty': false,
            'year': this.currYear
          });
        } else {
          spaceArray.push({
            'month': '',
            'date': '',
            'disabled': false,
            'selected': false,
            'empty': true ,
            'year': this.currYear
          });
        }
        prevLast--;
      }
    }
    this.tempArray = spaceArray.reverse().concat(this.completeDates);

    // Append Next Month Dates
    if (lastDate.getDay() !== 5) {
      // Not Friday
      let nIndex = 1;
      let dayCount = 5 - lastDate.getDay();
      if (dayCount < 0) {
        dayCount = 6 ;
      }
      for (let i = dayCount; i > 0 ; i--) {
        if (this.toContainNextMonth) {
          this.tempArray.push({
            'month': this.months.indexOf(month) + 2,
            'date': nIndex,
            'disabled': true,
            'selected': false,
            'empty': false,
            'year': this.currYear
          });
        } else {
          this.tempArray.push({
            'month': '',
            'date': '',
            'disabled': false,
            'selected': false,
            'empty': true,
            'year': this.currYear
          });
        }
        nIndex++;
      }
    }
    console.log(this.tempArray);
    return this.tempArray;
  }

  decideDate(month, year): number {
    let last = 31;
    switch (month) {
      case 'Feb': {
        // Feb
        last = 28;
        if ((parseInt(year, 10) % 4) === 0) {
          last = last + 1;
        }
      }
        break;
      case 'Apr' :
      case 'Jun' :
      case 'Sep' :
      case 'Nov' : {
        // April, June, September, November
        last = 30;
      }
        break;
      default : break;
    }
    return last;
  }

  setDate(sDate) {
    if (!sDate.disabled) {
      if (sDate.date !== '') {
        const tempMonth = this.months.indexOf(this.currMonth);
         // Set the new date array with active date
        const selectedDate = moment().year(this.currYear).month(tempMonth).date(sDate.date);
        if (selectedDate.isSameOrBefore(moment())) {
          // console.log('selected Date:', selectedDate)
          this.dateSelected.next(selectedDate);
        }
      }
    }
  }

}
