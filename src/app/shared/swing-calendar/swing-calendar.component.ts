import { Component, OnChanges, Input,
  EventEmitter, OnInit, Output }          from '@angular/core';
import * as moment                        from 'moment';

@Component({
  selector: 'swing-calendar',
  templateUrl: './swing-calendar.component.html',
  styleUrls: ['./swing-calendar.component.sass'],
})

export class SwingCalendarComponent implements OnInit {

  @Input() calendarType = 'date';
  @Input() startRangeInput: string;
  @Input() endRangeInput: string;
  @Input() minDate: string;
  @Input() maxDate: string;
  @Input() disableDays = [];
  @Input() toContainPrevMonth = true;
  @Input() toContainNextMonth = true;
  // value is used when we have input date
  @Input() value = '';
  @Output() dateSelected = new EventEmitter();
  @Output() rangeSelected = new EventEmitter();
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
  startRange: any;
  endRange: any;

  constructor( ) {
  }

  ngOnInit() {
    this.currMonth = this.months[new Date().getMonth()].toString();
    this.currYear = new Date().getFullYear();
    // Set previous and next months
    this.prevMonth = this.months[(12 + (new Date().getMonth() - 1)) % 12].toString();
    this.nextMonth = this.months[(12 + (new Date().getMonth() + 1)) % 12].toString();
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
      if (currentDate.isAfter(moment())) {
        dbld = true;
      }

      if (i !== date) {
        temp.push({
          'month': this.months.indexOf(month) + 1,
          'date': i,
          'disabled': dbld,
          'selected': false,
          'empty': false,
          'year': this.currYear,
          'calendarRange': false,
          'rangeStart': false,
          'rangeEnd': false
        });
      } else {
        temp.push({
          'month': this.months.indexOf(month) + 1,
          'date': i,
          'disabled': dbld,
          'selected': true,
          'empty': false,
          'year': this.currYear,
          'calendarRange': false,
          'rangeStart': false,
          'rangeEnd': false
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
            'year': this.currYear,
            'calendarRange': false,
            'rangeStart': false,
            'rangeEnd': false
          });
        } else {
          spaceArray.push({
            'month': '',
            'date': '',
            'disabled': false,
            'selected': false,
            'empty': true ,
            'year': this.currYear,
            'calendarRange': false,
            'rangeStart': false,
            'rangeEnd': false
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
            'year': this.currYear,
            'calendarRange': false,
            'rangeStart': false,
            'rangeEnd': false
          });
        } else {
          this.tempArray.push({
            'month': '',
            'date': '',
            'disabled': false,
            'selected': false,
            'empty': true,
            'year': this.currYear,
            'calendarRange': false,
            'rangeStart': false,
            'rangeEnd': false
          });
        }
        nIndex++;
      }
    }
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

  dayClicked (sDate) {
    if (this.calendarType === 'date') {
      this.setDate(sDate);
    } else if (this.calendarType === 'range' && !sDate.disabled) {
      if (!this.startRange) {
        this.startRange = sDate;
        this.dates.map((date) => {
          if (date.year === this.startRange.year && date.month === this.startRange.month && date.date === this.startRange.date) {
            date.rangeStart = true;
          } else {
            date.rangeStart = false;
          }
        })
      } else if (this.startRange) {
        this.endRange = sDate;
        const tempStartDate =  moment()
          .year(this.startRange.year)
          .month(this.startRange.month - 1 )
          .date(this.startRange.date);
        const tempEndDate = moment()
          .year(this.endRange.year)
          .month(this.endRange.month - 1 )
          .date(this.endRange.date);
        let result: any;
        if (tempStartDate.isBefore(tempEndDate)) {
          result = {
            'start': tempStartDate,
            'end': tempEndDate,
          }
        } else {
          result = {
            'start': tempEndDate,
            'end': tempStartDate
          }
        }

        this.rangeSelected.next(result);
      }

    }
  }

  dayHovered (sDate) {
    if (this.calendarType === 'range' && this.startRange) {
      const tempStartDate =  new Date(this.startRange.year, this.startRange.month, this.startRange.date, 0, 0, 0, 0).getTime();
      const tempEndDate = new Date(sDate.year, sDate.month, sDate.date, 0, 0, 0, 0).getTime();

      this.dates.map((date) => {
        if (!date.disabled) {
          const tempDate = new Date(date.year, date.month, date.date, 0, 0, 0, 0).getTime();

          if (tempStartDate <= tempEndDate) {
            if (tempStartDate <= tempDate && tempDate <= tempEndDate ) {
              date.calendarRange = true;
            } else {
              date.calendarRange = false;
            }
          }

          if (tempStartDate > tempEndDate) {
            if (tempStartDate >= tempDate && tempDate >= tempEndDate) {
              date.calendarRange = true;
            } else {
              date.calendarRange = false;
            }
          }
        }
      })
    }
  }

  setDate(sDate) {
    if (!sDate.disabled) {
      if (sDate.date !== '') {
        const tempMonth = this.months.indexOf(this.currMonth);
         // Set the new date array with active date
        const selectedDate = moment().year(this.currYear).month(tempMonth).date(sDate.date);
        if (selectedDate.isSameOrBefore(moment())) {
          this.dateSelected.next(selectedDate);
        }
      }
    }
  }

  setSpecificRange(range) {
    let result: any;

    switch (range) {
      case 'last7days': {
        result = {
          'start' : moment().subtract(7, 'days'),
          'end' : moment()
        };
        break;
      }
      case 'currentWeek': {
        result = {
          'start' : moment().startOf('week'),
          'end' : moment()
        };
        break;
      }
      case 'currentMonth': {
        result = {
          'start' : moment().startOf('month'),
          'end' : moment()

        };
        break;
      }
      case 'last3months': {
        result = {
          'start' : moment().subtract(3, 'months'),
          'end' : moment()
        };
        break;
      }
      default: {
        result = {
          'start' : moment().startOf('month'),
          'end' : moment()
        };
        break;
      }
    }

    this.rangeSelected.next(result);
  }
}
