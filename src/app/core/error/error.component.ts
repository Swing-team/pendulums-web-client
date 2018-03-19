import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.sass'],
})

export class ErrorComponent {
  @Input() errorMessages = [];
  @Output() close = new EventEmitter();

  constructor() {}

  setTime() {
    setTimeout(() => {
      this.errorMessages.splice(0, 1);
    }, 4000);
  }

  closeModal() {
    this.close.emit();
  }
}
