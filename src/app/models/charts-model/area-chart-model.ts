interface Series {
  name: string;
  value: number;
}

export interface AreaChartInterface {
  name: string;
  series: Series[];
}