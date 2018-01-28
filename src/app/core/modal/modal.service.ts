import {ComponentFactoryResolver, Injectable, ViewContainerRef, ApplicationRef} from '@angular/core';
import {ModalComponent} from './modal.component';

@Injectable()
export class ModalService {
  private modalComponentRef;
  private contentComponentRef;
  private rootViewContainerRef: ViewContainerRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) {
    // get root viewContainerRef
    this.rootViewContainerRef = this.applicationRef.components[0].instance.viewContainerRef;
  }

  show(modalConfig: ModalConfig) {
    const contentFactory = this.componentFactoryResolver.resolveComponentFactory(modalConfig.component);
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);

    const viewContainerRef = modalConfig.containerRef ? modalConfig.containerRef : this.rootViewContainerRef
    this.modalComponentRef = viewContainerRef.createComponent(modalFactory);
    this.contentComponentRef = this.modalComponentRef.instance.contentContainer.createComponent(contentFactory)

    if (modalConfig.customStyles) {
      console.log(modalConfig.customStyles);
      this.modalComponentRef.instance['customStyles'] = modalConfig.customStyles;
      console.log(this.modalComponentRef.instance['customStyles']);
    }

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
          this.contentComponentRef.instance[output].subscribe(modalConfig.outputs[output]);
        }
      }
    }

    this.modalComponentRef.instance['close'].subscribe(() => this.close());
    this.contentComponentRef.changeDetectorRef.detectChanges();
  }

  close() {
    // cleanup
    this.contentComponentRef.destroy();
    this.modalComponentRef.destroy();
  }
}

interface ModalConfig {
  component: any;
  /**
   * EXPERIMENTAL: provide {containerRef} only if you need to put modal inside a specific container but
   * be aware that any state change can cause rerender the parent and the modal would be destroyed!
   * we still don't know if it's an issue in our code or Angular it self... so this property is experimental.
   */
  containerRef?: ViewContainerRef;
  inputs?:  Object;
  outputs?: Object;
  customStyles?: Object;
}
