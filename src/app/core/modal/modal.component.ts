import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
})

export class ModalComponent {
  @Input() customStyles: Object;
  @Output() close = new EventEmitter();
  // used in modal service
  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainer: ViewContainerRef;

  closeModal() {
    this.close.emit();
  }
}
