import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
})

export class ModalComponent {
  @Output() close = new EventEmitter();

  closeModal() {
    this.close.emit();
  }
}
