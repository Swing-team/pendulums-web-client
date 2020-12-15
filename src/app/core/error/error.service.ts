import {ComponentFactoryResolver, Injectable, ViewContainerRef, ApplicationRef, OnInit} from '@angular/core';
import { ErrorComponent } from './error.component';

@Injectable()
export class ErrorService implements OnInit {
  private errorComponentRef;
  private rootViewContainerRef: ViewContainerRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) { }

  ngOnInit() {
    // get root viewContainerRef
    this.rootViewContainerRef = this.applicationRef.components[0].instance.viewContainerRef;
  }

  show(errorConfig: ErrorConfig) {
    if (this.errorComponentRef) {
      this.errorComponentRef.instance['errorMessages'].push(errorConfig.input);
      this.errorComponentRef.instance.setTime();
      return;
    }

    const errorFactory = this.componentFactoryResolver.resolveComponentFactory(ErrorComponent);
    this.errorComponentRef = this.rootViewContainerRef.createComponent(errorFactory);


    if (errorConfig.input) {
     this.errorComponentRef.instance['errorMessages'].push(errorConfig.input);
      this.errorComponentRef.instance.setTime();
    }

    this.errorComponentRef.changeDetectorRef.detectChanges();
  }
}

interface ErrorConfig {
  input?:  string;
}
