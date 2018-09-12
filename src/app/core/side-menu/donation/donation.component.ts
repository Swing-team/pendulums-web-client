import {
  Component, Output, EventEmitter,
  ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.sass']
})
export class DonationComponent {
  @Output() clickedOutSideOfDonation = new EventEmitter();

  constructor(private ref: ElementRef) { }

  @HostListener('document:click', ['$event'])
  clickOutOfDonation(event) {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.clickedOutSideOfDonation.emit(event);
    }
  }

}
