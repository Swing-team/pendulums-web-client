interface BarChartSeriesInterface {
  name: string;
  value: number;
}

export interface BarChartInterface {
  name: string;
  series: BarChartSeriesInterface[];
}