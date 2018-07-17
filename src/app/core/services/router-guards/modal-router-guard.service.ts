import { Injectable }                               from '@angular/core';
import { CanDeactivate,
  ActivatedRouteSnapshot, RouterStateSnapshot }     from '@angular/router';
import { ModalService } from '../../modal/modal.service';


@Injectable()
export class ModalRouterGuardService implements CanDeactivate<any> {

  constructor(private modalService: ModalService) {}
  canDeactivate(component: any,  route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    // this will prevent the page to change when modal is open and back button is pressed
    if (this.modalService.getIsModalOpen()) {
      this.modalService.close();
      return false;
    } else {
      return true;
    }
  }
}
