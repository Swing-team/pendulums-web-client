import {
  Component, ElementRef, EventEmitter,
  HostListener, Input, OnInit, Output
} from '@angular/core';

@Component({
  selector: 'swing-select',
  templateUrl: './swing-select.component.html',
  styleUrls: ['./swing-select.component.sass']
})
export class SwingSelectComponent implements OnInit {
  @Input() type: String = 'singleSelect';
  @Input() items: Array<any>;
  @Input() label: String = 'Select';
  @Input() selectedItemIndex: Number;
  @Input() itemTextAttribute: any;
  // Use alternative itemTextAttribute if that is Nullable
  @Input() alternativeItemTextAttribute: any;
  @Input() width: String = '100%';
  @Output() onItemClicked = new EventEmitter();

  selectedItem: any;
  selectItemsList: Array<any> = [];
  selectItemsListOutput: Array<any> = [];
  // Use this array to show tags in select items
  selectItemsListTags: Array<any> = [];
  isExpanded: Boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    if (this.type === 'multiSelect') {
      this.selectItemsList.push({
        index: 0,
        selected: false,
        item: {name: 'Select All'}});

      this.items.map((item, index) => {
        this.selectItemsList.push({
          index: index + 1,
          selected: false,
          item: item});
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (this.isExpanded && !this.elementRef.nativeElement.contains(event.target)) {
      this.toggleIsExpanded();
    }
  }

  itemClicked(index, selectedItem) {
    if (this.type === 'singleSelect')  {
      this.selectedItemIndex = index;
      this.selectedItem = selectedItem;
      this.toggleIsExpanded();
      this.onItemClicked.emit({index, selectedItem});
    }
  }

  addItemToOutputList(event, selectedItemIndex) {
    // check an item
    if (this.type === 'multiSelect' && event.target.checked) {
      if (selectedItemIndex === 0) {
        this.selectItemsList.map((selectedItem) => {
          selectedItem.selected = true;
        });
      } else {
        this.selectItemsList[selectedItemIndex].selected = true;
        // check if all items are selected
        if (this.selectItemsListOutput.length === this.selectItemsList.length - 2) {
          this.selectItemsList[0].selected = true;
        }
      }
    }
    // uncheck item
    if (this.type === 'multiSelect' && !event.target.checked) {
      if (selectedItemIndex === 0) {
        this.selectItemsList.map((selectedItem) => {
          selectedItem.selected = false;
        });
      } else {
        if (this.selectItemsList[0].selected === true) {
          this.selectItemsList[0].selected = false;
        }
        this.selectItemsList[selectedItemIndex].selected = false;
      }
    }
    // preparing output
    this.selectItemsListOutput = [];
    this.selectItemsListTags = [];
    this.selectItemsList.map((item) => {
      if (item.selected === true && item.index !== 0) {
        const tempItem = {
          index: item.index - 1,
          item: item.item
        };
        this.selectItemsListOutput.push(tempItem)

        // preparing tags list and check null attributes like as view
        if (this.itemTextAttribute) {
          if (item.item[this.itemTextAttribute]) {
            this.selectItemsListTags.push(item.item[this.itemTextAttribute]);
          } else if (this.alternativeItemTextAttribute) {
            if (item.item[this.alternativeItemTextAttribute]) {
              this.selectItemsListTags.push(item.item[this.alternativeItemTextAttribute]);
            } else {
              this.selectItemsListTags.push('no name!');
            }
          } else {
            this.selectItemsListTags.push(item);
          }
        } else {
          this.selectItemsListTags.push(item);
        }
      }
    });
    this.onItemClicked.emit(this.selectItemsListOutput)
  }

  toggleIsExpanded() {
    this.isExpanded = !this.isExpanded;
  }
}
