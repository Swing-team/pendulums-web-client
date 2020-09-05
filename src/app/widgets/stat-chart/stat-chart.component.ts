import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AreaChartInterface } from 'app/models/charts-model/area-chart-model';
import { BarChartInterface } from './charts-models/bar-chart.model';
import * as shape from 'd3-shape';

type ChartsType = 'area' | 'bar';

@Component({
  selector: 'stat-chart',
  templateUrl: './stat-chart.component.html',
  styleUrls: ['./stat-chart.component.sass'],
})

export class StatChartComponent implements OnInit {
  @Input() selectItems: string[];
  @Input() chartType: ChartsType;
  @Input() areaChartData: AreaChartInterface[];
  @Input() barChartData: BarChartInterface[];
  @Input() trimXAxis: boolean = true;
  @Input() trimYAxis: boolean = true;
  @Input() xAxisTickFormatting: any; // callable function
  @Input() yAxisTickFormatting: any; // callable function
  @Output() onSelectItemChanged = new EventEmitter();

  curve = shape.curveCatmullRom;

  constructor() { }

  ngOnInit() { }

  selectItemChanged(event: {index: number; selectedItem: string}) {
    this.onSelectItemChanged.emit(event);
  }
}