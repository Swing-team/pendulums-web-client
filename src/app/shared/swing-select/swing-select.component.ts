import {
  Component, ElementRef, EventEmitter,
  HostListener, Input, OnChanges, OnInit, Output, SimpleChange
} from '@angular/core';

@Component({
  selector: 'swing-select',
  templateUrl: './swing-select.component.html',
  styleUrls: ['./swing-select.component.sass']
})
export class SwingSelectComponent implements OnInit, OnChanges {
  @Input() type: String = 'singleSelect';
  @Input() items: Array<any>;
  @Input() label: String = 'Select';
  @Input() selectAllLabel: string;
  @Input() selectedItemIndex: Array<number>;
  @Input() itemTextAttribute: any;
  @Input() width: String = '100%';
  @Input() hideArrow = false;
  @Output() onItemClicked = new EventEmitter();

  selectedItem: any;
  selectItemsList: Array<any> = [];
  selectItemsListOutput: Array<any> = [];
  // Use this array to show tags in select items
  selectItemsListTags: Array<any> = [];
  isExpanded: Boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    if (this.type === 'singleSelect') {
      this.selectedItem = this.items[this.selectedItemIndex[0]];
    }

    if (this.type === 'multiSelect') {
      this.selectItemsList.push({
        index: 0,
        selected: this.selectedItemIndex.length ===  this.items.length ? true : false,
        item: {name: this.selectAllLabel}});

      this.items.map((item, index) => {
        const tempItem = {
          index: index + 1,
          selected: this.selectedItemIndex.indexOf(index) > -1 ? true : false,
          item: item};
        this.selectItemsList.push(tempItem);
        if (tempItem.selected === true) {
          // preparing tags list and check null attributes like as view
          this.prepareTagsList(tempItem);
        }
      });
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.selectedItemIndex && changes.selectedItemIndex.currentValue) {
      this.selectedItem = this.items[this.selectedItemIndex[0]];
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
      this.selectedItemIndex = [index];
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
        this.selectItemsListOutput.push(tempItem);

        // preparing tags list and check null attributes like as view
        this.prepareTagsList(item);
      }
    });
    this.onItemClicked.emit(this.selectItemsListOutput)
  }

  prepareTagsList(item) {
    if (this.itemTextAttribute) {
      if (item.item[this.itemTextAttribute[0]]) {
        this.selectItemsListTags.push(item.item[this.itemTextAttribute[0]]);
      } else if (this.itemTextAttribute[1]) {
        if (item.item[this.itemTextAttribute[1]]) {
          this.selectItemsListTags.push(item.item[this.itemTextAttribute[1]]);
        } else {
          this.selectItemsListTags.push('no name!');
        }
      } else {
        this.selectItemsListTags.push('no name!');
      }
    } else {
      this.selectItemsListTags.push(item);
    }
  }

  toggleIsExpanded() {
    this.isExpanded = !this.isExpanded;
  }
}
