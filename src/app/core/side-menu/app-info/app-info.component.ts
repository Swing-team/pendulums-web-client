import { Component, OnInit }                     from '@angular/core';
import { VERSION }                               from '../../../../environments/version';

@Component({
  selector: 'app-info',
  templateUrl: './app-info.component.html',
  styleUrls: ['./app-info.component.sass']
})
export class AppInfoComponent implements OnInit {

  appVersion: string;

  constructor() { }

  ngOnInit() {
    this.appVersion = VERSION
  }
}
