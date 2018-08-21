import { ComponentFactoryResolver, Injectable,
         ViewContainerRef, ApplicationRef, ComponentRef }         from '@angular/core';
import { ModalComponent }                           from './modal.component';
import { Subscription }                             from 'rxjs/Subscription';

@Injectable()
export class ModalService {
  private modalComponentRef: ComponentRef<ModalComponent>;
  private contentComponentRef;
  private rootViewContainerRef: ViewContainerRef;
  private subscriptions: Array<Subscription> = [];
  private isModalOpen: boolean;

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
      this.modalComponentRef.instance['customStyles'] = modalConfig.customStyles;
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
          this.subscriptions.push(this.contentComponentRef.instance[output].subscribe(modalConfig.outputs[output]));
        }
      }
    }

    document.getElementsByTagName('html')[0].classList.add('ps-scroll-lock');
    this.subscriptions.push(this.modalComponentRef.instance['close'].subscribe((ignoreIsModalOpen) => this.close(ignoreIsModalOpen)));
    this.contentComponentRef.changeDetectorRef.detectChanges();
    this.isModalOpen = true;
  }

  getIsModalOpen() {
    return this.isModalOpen;
  }

  // TODO: Ashkan 7/17/2018:
  // this will close the modal if the previous page is the same that we are in it
  // see modal.component.ts to find out what is ignoreIsModalOpen actually is
  close(ignoreIsModalOpen?: boolean) {
    // cleanup
    this.contentComponentRef.destroy();
    this.modalComponentRef.destroy();
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
    if (!ignoreIsModalOpen) {
      this.isModalOpen = false;
    }
    document.getElementsByTagName('html')[0].classList.remove('ps-scroll-lock');
  }
}

interface ModalConfig {
  component: any;
  /**
   * EXPERIMENTAL: provide {containerRef} only if you need to put modal inside a specific container but
   * be aware that any state change can cause re-render the parent and the modal would be destroyed!
   * we still don't know if it's an issue in our code or Angular it self... so this property is experimental.
   */
  containerRef?: ViewContainerRef;
  inputs?:  Object;
  outputs?: Object;
  customStyles?: Object;
}
