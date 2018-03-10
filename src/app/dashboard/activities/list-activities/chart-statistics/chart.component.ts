import 'rxjs/add/operator/switchMap';
import { Component, Inject, Input }         from '@angular/core';
import { APP_CONFIG }                       from '../../../../app.config';
import { User }                             from '../../../../shared/state/user/user.model';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass']
})

export class ChartComponent {
  @Input() user: Array<User>;
  toDate: string;
  fromDate: string;
  calenderShow = false;

  multi = [
    {
      "name": "Germany",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 5
        },
        {
          "name": "2012",
          "value": 6
        }
      ]
    },
    {
      "name": "USA",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 8
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "France11",
      "series": [
        {
          "name": "2010",
          "value": 5
        },
        {
          "name": "2011",
          "value": 6
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Germanjjy12",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 5
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "UjjSA9",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 8
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Frajjnce8",
      "series": [
        {
          "name": "2010",
          "value": 5
        },
        {
          "name": "2011",
          "value": 5
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Germany777",
      "series": [
        {
          "name": "2010",
          "value": 7.3
        },
        {
          "name": "2011",
          "value": 5.8
        },
        {
          "name": "2012",
          "value": 5.8
        }
      ]
    },
    {
      "name": "USA666",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 8
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Fradsdnce66",
      "series": [
        {
          "name": "2010",
          "value": 5
        },
        {
          "name": "2011",
          "value": 4
        },
        {
          "name": "2012",
          "value": 5.5
        }
      ]
    },
    {
      "name": "Gersdasasamanjjy55",
      "series": [
        {
          "name": "2010",
          "value": 7.3
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "UjsdsdjSA5",
      "series": [
        {
          "name": "2010",
          "value": 7.8
        },
        {
          "name": "2011",
          "value": 8
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Frasdsdjjnce444",
      "series": [
        {
          "name": "2010",
          "value": 5
        },
        {
          "name": "2011",
          "value": 9
        },
        {
          "name": "2012",
          "value": 6
        }
      ]
    },
    {
      "name": "UjsdsdjSA33",
      "series": [
        {
          "name": "2010",
          "value": 7
        },
        {
          "name": "2011",
          "value": 8
        },
        {
          "name": "2012",
          "value": 5
        }
      ]
    },
    {
      "name": "Frassdjjnce22",
      "series": [
        {
          "name": "2010",
          "value": 5
        },
        {
          "name": "2011",
          "value": 6
        },
        {
          "name": "2012",
          "value": 4
        }
      ]
    }
  ];


  // options
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = false;
  showYAxisLabel = false;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor (@Inject(APP_CONFIG) private config) {
  }

  showCalender() {
    this.calenderShow = true;
  }

  closeCalender() {
    this.calenderShow = false;
  }

  updateDates(event) {
    console.log('result:', event);
    this.calenderShow = false;

  }
}


