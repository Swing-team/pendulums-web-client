import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'swing-tag-input',
  templateUrl: './swing-tag-input.component.html',
  styleUrls: ['./swing-tag-input.component.sass']
})

export class SwingTagInputComponent implements OnInit{
  @Input() items: Array<any>;
  @Input() length = 0;

  constructor() {}

  ngOnInit() {
  }
}
