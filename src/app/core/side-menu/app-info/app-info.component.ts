import { Component, Input }                     from '@angular/core';
import { VERSION }                              from '../../../../environments/version';

@Component({
  selector: 'app-info',
  templateUrl: './app-info.component.html',
  styleUrls: ['./app-info.component.sass']
})
export class AppInfoComponent {

  @Input() version: string;

  constructor() { }

}
