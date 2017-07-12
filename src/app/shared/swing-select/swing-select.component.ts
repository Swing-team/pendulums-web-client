import {Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'swing-select',
  templateUrl: './swing-select.component.html',
  styleUrls: ['./swing-select.component.sass']
})
export class SwingSelectComponent {
  @Input() items: Observable<any>;
  @Input() label: String = 'Select';
  @Input() selectedItemIndex: Number;
  @Input() itemTextAttribute: String;
  @Output() onItemClicked = new EventEmitter();

  selectedItem: any;
  isExpanded: Boolean = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (this.isExpanded && !this.elementRef.nativeElement.contains(event.target)) {
      this.toggleIsExpanded();
    }
  }

  itemClicked(index, selectedItem) {
    this.selectedItemIndex = index;
    this.selectedItem = selectedItem;
    this.toggleIsExpanded();
    this.onItemClicked.emit({index, selectedItem});
  }

  toggleIsExpanded() {
    this.isExpanded = !this.isExpanded;
  }
}
