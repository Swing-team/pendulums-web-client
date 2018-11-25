import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.sass']
})
export class TabComponent implements OnInit {
  @Input() tabs = [];
  @Output() onTabClicked = new EventEmitter();

  selectedTab = 'Notes';
  constructor() { }

  ngOnInit() {
  }

  toggle(tab) {
    this.selectedTab = tab.name;
    this.onTabClicked.emit(tab);

  }

}
