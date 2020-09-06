import {
  Component, EventEmitter, Input,
  OnInit, Output, ViewEncapsulation, OnChanges, SimpleChanges
} from '@angular/core';
import { ActivityService }                  from 'app/core/services/activity.service';
import { Project }                          from 'app/shared/state/project/project.model';
import * as moment                          from 'moment';

interface ChartDataType {
  name: string,
  series: {
    name: string,
    value: number,
    extras?: any }[]
};

type ChartTypes = 'stack' | 'group';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class ChartComponent implements OnInit, OnChanges {
  @Input() project: Project;
  @Input() parentHasActivity: boolean = true;
  @Input() selectedUsers: string[];
  @Output() chartLoaded = new EventEmitter();
  @Input() toDate: number;
  @Input() fromDate: number;
  @Input() calendarUpdateEvent: any;
  private dateRange: number;
  dateString: string;
  calenderShow = false;

  usersWithTotal: any;
  multiLevelData: ChartDataType[] = [];
  chartType: ChartTypes  = 'stack';

  constructor (private activityService: ActivityService) {
  }

  ngOnInit() {
    this.dateRange = 7;
    // get data from server
    this.getStatAndPrepareData();

  }

  ngOnChanges(changes: SimpleChanges) {
    const newCalendarEvent = changes.calendarUpdateEvent ? changes.calendarUpdateEvent.currentValue : null;
    if (newCalendarEvent) {
      this.updateDates(newCalendarEvent);
    }
  }

  formatDateTick(time: number): string {
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

  getStatAndPrepareData() {
    if (this.fromDate && this.toDate) {
      this.multiLevelData = [];
      const tempUsersWithTotal = [];
      
      if (this.selectedUsers.length > 0) {
        this.activityService.getStat(this.project.id, this.selectedUsers, this.fromDate, this.toDate).then((res) => {
  
          const userStatsResult: ChartDataType[] = [];
  
          res.result.forEach((userStats) => {
            userStats.stats.forEach((stat, index) => {
              // change xAxisName based on selected dates
              let xAxisName =  moment(Number(stat.id)).format('MMM Do');
              if (res.columnSize !== 1) {
                if (index + 2 <= userStats.stats.length) {
                  const firstIdsMonth =  moment(Number(stat.id)).month();
                  const secondIdsMonth =  moment(Number(userStats.stats[index + 1].id) - 1).month();
                  if (firstIdsMonth === secondIdsMonth) {
                    xAxisName += '-' + moment(Number(userStats.stats[index + 1].id) - 1).format('Do');
                  } else {
                    xAxisName += '-' + moment(Number(userStats.stats[index + 1].id) - 1).format('MMM Do');
                  }
                }
              }
              
              // Add user stat to chart result
              const userStatsIndex = userStatsResult.findIndex(x => x.name === xAxisName);
              const user = this.project.teamMembers.find(user => user.id === userStats._id);
              if (userStatsIndex === -1) {
                userStatsResult.push({
                  name: xAxisName,
                  series: [{
                    name: user.name ? user.name : user.email,
                    value: stat.value,
                    extras: {
                      userName: user.name ? user.name : user.email,
                      userId: user.id
                    }
                  }]
                });
              } else {
                userStatsResult[userStatsIndex].series.push({
                  name: user.name ? user.name : user.email,
                  value: stat.value,
                  extras: {
                    userName: user.name ? user.name : user.email,
                    userId: user.id
                  }
                });
              }
              
              // Add user totalHour to tempUsersWithTotal
              // if user does not exits in tempUsersWithTotal, pushes a new object else change the totalHours
              const tempUserWithTotal = tempUsersWithTotal.find(user => user.userId === userStats._id);
              if (!tempUserWithTotal) {
                tempUsersWithTotal.push({
                  userId: user.id,
                  name: user.name ? user.name : user.email,
                  totalHours: Number(stat.value),
                });
              } else {
                tempUserWithTotal.totalHours += Number(stat.value);
              }
            });
          });
  
          userStatsResult.forEach((userStats) => {
            userStats.series.map(userStat => {
              const tempUser = tempUsersWithTotal.find(user => user.userId === userStat.extras.userId);
              userStat.name = userStat.name + ' (' + this.formatDateTick(tempUser.totalHours) + ')';
              return userStat;
            });
          });
  
          let empty = ' ';
          while (userStatsResult.length < 5) {
            userStatsResult.push({
              name: empty,
              series: [{
                name: empty,
                value: 0,
              }]
            });
            empty += ' ';
          }
          this.multiLevelData = userStatsResult;
        });
      }
  
      this.chartLoaded.emit();
    }
  }

  updateDates(event) {
    this.dateRange = moment.duration(Number(this.toDate) - Number(this.fromDate)).asDays();
    this.getStatAndPrepareData();
  }

  changeChart(chartType: ChartTypes) {
    this.chartType = chartType;
  }
}
