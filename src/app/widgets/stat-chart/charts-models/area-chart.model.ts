interface Series {
  name: string;
  value: number;
  extras: any;
}

export interface AreaChartInterface {
  name: string;
  series: Series[];
}
