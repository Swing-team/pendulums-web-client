import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import { ErrorComponent } from './error.component';

@Injectable()
export class ErrorService {
  private errorComponentRef;
  private viewContainerRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  setViewContainerRef(vcRef: ViewContainerRef) {
    this.viewContainerRef = vcRef;
  }

  show(errorConfig: ErrorConfig) {
    if (this.errorComponentRef) {
      this.errorComponentRef.instance['errorMessages'].push(errorConfig.input);
      return;
    }

    const errorFactory = this.componentFactoryResolver.resolveComponentFactory(ErrorComponent);

    this.errorComponentRef = this.viewContainerRef.createComponent(errorFactory);


    if (errorConfig.input) {
     this.errorComponentRef.instance['errorMessages'].push(errorConfig.input);
    }

    this.errorComponentRef.instance['close'].subscribe(() => this.close());
    this.errorComponentRef.changeDetectorRef.detectChanges();
  }

  close() {
    // cleanup
    this.errorComponentRef.destroy();
    this.errorComponentRef = null;
  }
}

interface ErrorConfig {
  input?:  string;
}
