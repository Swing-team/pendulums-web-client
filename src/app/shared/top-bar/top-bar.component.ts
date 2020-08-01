import { Component, Input, OnInit, OnDestroy, DoCheck, KeyValueDiffers } from '@angular/core';
import { SideMenuService } from 'app/core/services/side-menu.service';
import { Subscription } from 'rxjs';
import { User } from '../state/user/user.model';
import { Status } from '../state/status/status.model';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.sass'],
})
export class TopBarComponent implements OnInit, OnDestroy, DoCheck {
  @Input() user: User;
  @Input() status: Status;
  @Input() title: string;
  hasNotification: boolean;
  isSideMenuActive: boolean;
  subscriptions: Subscription[] = [];
  differ: any;
  
  constructor(
    private readonly sideMenuService: SideMenuService,
    private differs: KeyValueDiffers,
  ) {
    this.differ = this.differs.find({}).create();
  }


  ngOnInit() {
    this.subscriptions.push(
      this.sideMenuService.getIsSideMenuActiveAsObservable().subscribe((isSideMenuActive) => {
        this.isSideMenuActive = isSideMenuActive;
      })
    );
    
    if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
      this.hasNotification = true;
    }
  }

  ngDoCheck() {
    const change = this.differ.diff(this.user.pendingInvitations);
    if (change) {
      if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
        this.hasNotification = true;
      } else {
        this.hasNotification = false;
      }
    }
  }

  changeIsSideMenuActiveState() {
    this.sideMenuService.changeIsSideMenuActive(!this.isSideMenuActive);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}