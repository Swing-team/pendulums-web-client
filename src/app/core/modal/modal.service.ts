import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import {ModalComponent} from './modal.component';

@Injectable()
export class ModalService {
  private modalComponentRef;
  private contentComponentRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  show(modalConfig: ModalConfig) {
    const contentFactory = this.componentFactoryResolver.resolveComponentFactory(modalConfig.component);
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);

    this.contentComponentRef = modalConfig.containerRef.createComponent(contentFactory);
    this.modalComponentRef = modalConfig.containerRef.createComponent(modalFactory,
      0, undefined, [[this.contentComponentRef.location.nativeElement]]);


    if (modalConfig.inputs) {
      for (const input in modalConfig.inputs) {
        if (modalConfig.inputs.hasOwnProperty(input)) {
          this.contentComponentRef.instance[input] = modalConfig.inputs[input];
        }
      }
    }

    if (modalConfig.outputs) {
      for (const output in modalConfig.outputs) {
        if (modalConfig.outputs.hasOwnProperty(output)) {
          this.contentComponentRef.instance[output].subscribe(output);
        }
      }
    }

    this.modalComponentRef.instance['close'].subscribe(() => this.close());
    this.contentComponentRef.changeDetectorRef.detectChanges();
  }

  close() {
    // cleanup
    console.log(this.contentComponentRef)

    this.contentComponentRef.destroy();
    this.modalComponentRef.destroy();
  }
}

interface ModalConfig {
  component: any;
  containerRef: ViewContainerRef;
  inputs?:  Array<any>;
  outputs?: Array<any>;
}
