import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'swing-switch',
  templateUrl: './swing-switch.component.html',
  styleUrls: ['./swing-switch.component.sass']
})

export class SwingSwitchComponent {
  @Input() defaultValue: boolean;
  @Output() onChange = new EventEmitter();

  constructor() {
  }

  onClick() {
    this.defaultValue = !this.defaultValue;
    this.onChange.emit({checked: this.defaultValue});
  }
}
