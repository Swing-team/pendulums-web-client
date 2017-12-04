import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.sass'],
})

export class ErrorComponent implements OnInit {
  @Input() errorMessages = [];
  @Output() close = new EventEmitter();

  ngOnInit() {
    if (this.errorMessages.length > 0) {
      setInterval(() => {
        this.errorMessages.splice(0, 1);
      }, 3000);
    }
  }

  closeModal() {
    this.close.emit();
  }
}
