import { Directive, ElementRef, Input } from '@angular/core';
import * as Inputmask from 'inputmask';


@Directive({
  selector: '[app-restrict-input]',
})
export class RestrictInputDirective {

  // map of some of the regex strings I'm using (TODO: add your own)
  private regexMap = {
    time: '[0-2][0-9]:[0-5][0-9]',
  };

  constructor(private el: ElementRef) {}

  @Input('app-restrict-input')
  public set defineInputType(type: string) {
    Inputmask({regex: this.regexMap[type], placeholder: '00:00'})
      .mask(this.el.nativeElement);
  }
}
