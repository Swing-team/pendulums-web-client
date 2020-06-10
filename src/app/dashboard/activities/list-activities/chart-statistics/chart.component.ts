import {
  Component, EventEmitter, Input,
  OnInit, Output, ViewEncapsulation
} from '@angular/core';
import { cloneDeep }                        from 'lodash';
import { ActivityService }                  from '../../../../core/services/activity.service';
import { Project }                          from 'app/shared/state/project/project.model';
import * as moment                          from 'moment';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class ChartComponent implements OnInit {
  @Input() project: Project;
  @Input() parentHasActivity: boolean = true;
  @Input() selectedUsers: string[];
  @Output() chartLoaded = new EventEmitter();
  toDate: number;
  fromDate: number;
  private dateRange: number;
  dateString: string;
  calenderShow = false;

  usersWithTotal: any;
  multiLevelData = [];
  chartType: 'stacked' | 'grouped' = 'stacked';

  constructor (private activityService: ActivityService) {
  }

  ngOnInit() {
    // configure date range for first api call
    this.fromDate = moment().subtract(7, 'days').startOf('day').valueOf();
    this.toDate = moment().add(1, 'days').startOf('day').valueOf();
    this.dateString = moment().subtract(7, 'days').format('MMM Do');
    this.dateRange = 7;
    const firstIdsMonth =  moment().subtract(7, 'days').month();
    const secondIdsMonth =  moment().month();
    let temp = '';
    if (firstIdsMonth === secondIdsMonth) {
      temp = moment().format('Do');
    } else {
      temp = moment().format('MMM Do');
    }
    this.dateString = this.dateString + ' - ' + temp;

    // get data from server
    this.getStatAndPrepareData();

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
    this.multiLevelData = [];
    const tempUsersWithTotal = [];
    
    if (this.selectedUsers.length > 0) {
      this.activityService.getStat(this.project.id, this.selectedUsers, this.fromDate, this.toDate).then((res) => {

        const userStatsResult: {name: string, series: { name: string, value: number }[]}[] = [];
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
              userStatsResult.push({name: xAxisName, series: [{name: user.name ? user.name : user.email, value: stat.value}]});
            } else {
              userStatsResult[userStatsIndex].series.push({name: user.name ? user.name : user.email, value: stat.value});
            }
            
            // Add user totalHour to tempUsersWithTotal
            // if user does not exits in tempUsersWithTotal, pushes a new object else change the totalHours
            const tempUserWithTotal = tempUsersWithTotal.find(user => user.userId === userStats._id);
            if (!tempUserWithTotal) {
              tempUsersWithTotal.push({
                disabled: false,
                userName: user.name,
                email: user.email,
                userId: userStats._id,
                totalHoursPerUser: Number(stat.value),
                humanizedHour: '',
                profileImage: user.profileImage
              });
            } else {
              tempUserWithTotal.totalHoursPerUser += stat.value;
            }
          });
        });
        
        this.multiLevelData = userStatsResult;
      });
    }
    
    // we should initial usersWithTotal array and not push in it
    this.usersWithTotal = tempUsersWithTotal;
  }

  showCalender() {
    this.calenderShow = true;
  }

  closeCalender() {
    this.calenderShow = false;
  }

  updateUsersWithTotal(series) {
    const tempArray = cloneDeep(this.usersWithTotal)

    // We use this variable to handle bug of chart
    // that happen when all of items in legend not selected but it selects all of items in legend list
    // so we check if count of selected items be zero we should select all of them again
    let displayingUserCounts = 0 ;

    tempArray.map((item) => {
      if (!item.disabled) {
        displayingUserCounts++;
      }
    });

    this.usersWithTotal = [];
    if (!series.disabled) {
      tempArray.map((item) => {
        if (item.userName !== '') {
          if (item.userName === series.key) {
            item.disabled = true;
            displayingUserCounts--;
          }
        } else if (item.userName === '') {
          if (item.email === series.key) {
            item.disabled = true;
            displayingUserCounts--;
          }
        }
      })
    } else if (series.disabled) {
      tempArray.map((item) => {
        if (item.userName !== '') {
          if (item.userName === series.key) {
            item.disabled = false;
            displayingUserCounts++;
          }
        } else if (item.userName === '') {
          if (item.email === series.key) {
            item.disabled = false;
            displayingUserCounts++;
          }
        }
      })
    }

    // here we check count of items if it be zero it means that chart has selected all of items so we should do it too
    if (displayingUserCounts === 0) {
      tempArray.map((item) => {
        item.disabled = false;
      })
    }

    this.usersWithTotal = tempArray;
  }

  updateDates(event) {
    this.dateString = event.start.format('MMM Do');
    const firstIdsMonth =  event.start.month();
    const secondIdsMonth =  event.end.month();
    let temp = '';
    if (firstIdsMonth === secondIdsMonth) {
      temp = event.end.format('Do');
    } else {
      temp = event.end.format('MMM Do');
    }
    this.dateString = this.dateString + ' - ' + temp;

    this.fromDate = event.start.startOf('day').valueOf();
    this.toDate = (event.end.add(1, 'days')).startOf('day').valueOf();
    this.dateRange = moment.duration(Number(this.toDate) - Number(this.fromDate)).asDays();
    this.getStatAndPrepareData();
    this.calenderShow = false;
  }
}
