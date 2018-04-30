import 'rxjs/add/operator/switchMap';
import {
  Component, EventEmitter, Inject, Input, OnChanges,
  OnInit, Output, SimpleChange, ViewEncapsulation
} from '@angular/core';
import { APP_CONFIG }                       from '../../../../app.config';
import { cloneDeep }                        from 'lodash';
import { ActivityService }                  from '../../../shared/activity.service';
import { Project }                          from 'app/shared/state/project/project.model';
import * as moment                          from 'moment';

declare const d3: any;

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class ChartComponent implements OnInit, OnChanges {
  @Input() project: Project;
  @Input() selectedUsers: string[];
  @Output() chartLoaded = new EventEmitter();
  toDate: Number;
  fromDate: Number;
  private dateRange: any;
  dateString: string;
  calenderShow = false;

  usersWithTotal: any;
  multiLevelData = [];
  options;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService) {
  }

  ngOnInit() {
    // configure date range for first api call
    this.fromDate = moment().subtract(7, 'days').startOf('day').valueOf();
    this.toDate = moment().add(1, 'days').startOf('day').valueOf();
    this.dateString = moment().subtract(7, 'days').format('MMM Do');
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

    // configure ng2-nvd3 chart
    this.options = {
      chart: {
        type: 'multiBarChart',
        height: 450,
        // color: d3.scale.category10().range(),
        // color: ['red', 'darkorange', 'green', 'darkred', 'darkviolet'],
        margin : {
          top: 60,
          right: 20,
          bottom: 30,
          left: 45
        },
        legend: {
          margin: {
            top: 5,
            right: 0,
            bottom: 5,
            left: 0
          },
          dispatch: {
            legendClick: (series) => {
              this.updateUsersWithTotal(series);
            },
          }
        },
        clipEdge: true,
        // staggerLabels: true,
        duration: 500,
        stacked: true,
        x: function(d){ return d.x; },
        y: function(d){ return d.y; },
        useInteractiveGuideline: true,
        showControls: false,
        xAxis: {
          showMaxMin: false
        },
        yAxis: {
          axisLabelDistance: 0,
          tickFormat: function formatDateTick(time) {
            let minutes = time / 1000 / 60;
            const hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            return d3.time.format('%H:%M')(date);
          }
        }
      }
    };
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.selectedUsers && changes.selectedUsers.currentValue && !changes.selectedUsers.firstChange) {
      this.getStatAndPrepareData();
    }
  }

  getStatAndPrepareData() {
    this.multiLevelData = [];
    const tempUsersWithTotal = [];
    if (this.selectedUsers.length > 0) {
      this.activityService.getStat(this.project.id, this.selectedUsers, this.fromDate, this.toDate).then( (res) => {
        const temInputStatArray = res.result;
        temInputStatArray.map((data) => {
          const series = [];
          let totalHourPerUser = 0;
          const user = this.project.teamMembers.filter(x => x.id === data._id)[0];

          data.stats.map((userStat, index) => {
            // push empty column when total columns are less than 4
            if (index === 0 && this.dateRange > 0 && this.dateRange < 4) {
              series.push({
                'x': ' ',
                'y': 0
              });
              series.push({
                'x': '  ',
                'y': 0
              })
            }

            // prepare xAxis name base on ids
            let xAxisName =  moment(Number(userStat.id)).format('MMM Do');
            if (res.columnSize !== 1) {
              if (index + 2 <= data.stats.length) {
                const firstIdsMonth =  moment(Number(userStat.id)).month();
                const secondIdsMonth =  moment(Number(data.stats[index + 1].id) - 1).month();
                let temp = '';
                if (firstIdsMonth === secondIdsMonth) {
                  temp = moment(Number(data.stats[index + 1].id) - 1).format('Do');
                } else {
                  temp = moment(Number(data.stats[index + 1].id) - 1).format('MMM Do');
                }
                xAxisName = xAxisName + '-' + temp;
              }
            }

            // calculate time duration of ids
            if (userStat.value >= 0) {
              const duration = userStat.value;
              series.push({
                'x': xAxisName,
                'y': duration
              });
              totalHourPerUser = totalHourPerUser + duration;
            }
            // push empty column when total columns are less than 4
            if (index === data.stats.length - 1 && this.dateRange > 0 && this.dateRange < 4) {
              series.push({
                'x': '   ',
                'y': 0
              });
              series.push({
                'x': '    ',
                'y': 0
              })
            }
          });

          this.multiLevelData.push({
            'key': user.name ? user.name : user.email,
            'values': series
            // color: ps-colors array
          });

          const x = {
            disabled: false,
            userName: user.name,
            email: user.email,
            userId: data._id,
            totalHoursPerUser: Number((totalHourPerUser)),
            humanizedHour: '',
            profileImage: user.profileImage
          };
          tempUsersWithTotal.push(x);
        });

        this.chartLoaded.emit();
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
    const tempArray = cloneDeep(this.usersWithTotal);
    this.usersWithTotal = [];
    if (!series.disabled) {
      tempArray.map((item) => {
        if (item.userName === series.key) {
          item.disabled = true;
        }
      })
    } else if (series.disabled) {
      tempArray.map((item) => {
        if (item.userName === series.key) {
          item.disabled = false;
        }
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

    this.dateRange = moment.duration(Number(this.toDate) - Number(this.fromDate)).asDays();
    this.fromDate = event.start.startOf('day').valueOf();
    this.toDate = (event.end.add(1, 'days')).startOf('day').valueOf();
    this.getStatAndPrepareData();
    this.calenderShow = false;
  }
}


