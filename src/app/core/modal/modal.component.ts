import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
})

export class ModalComponent {
  @Input() customStyles: Object;
  @Input() customBodyStyles: Object;
  @Output() close = new EventEmitter();
  // used in modal service
  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainer: ViewContainerRef;

  constructor(location: PlatformLocation) {
    // TODO: Ashkan 7/17/2018 :
    // this will actually close the modal but we had to create ignoreIsModalOpen
    // to prevent router to change so ...
    location.onPopState(() => {
      this.closeModal(true);
    })
  }

  preventOverScroll(event) {
    event.preventDefault();
  }

  closeModal(ignoreIsModalOpen?: boolean) {
    this.close.emit(ignoreIsModalOpen);
  }
}
