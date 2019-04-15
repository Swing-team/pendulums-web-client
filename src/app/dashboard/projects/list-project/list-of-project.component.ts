import { Component, Input, OnInit, OnChanges }                           from '@angular/core';
import { Observable }                                 from 'rxjs/Observable';
import { ModalService }                               from '../../../core/modal/modal.service';
import { CreateProjectComponent }                     from '../create-project/create-project.component';
import { Project }                                    from '../../../shared/state/project/project.model';
import { Activity }                                   from '../../../shared/state/current-activity/current-activity.model';
import { Status }                                     from '../../../shared/state/status/status.model';
import { User }                                       from '../../../shared/state/user/user.model';
import { ErrorService }                               from '../../../core/error/error.service';
import { CookieService }                              from 'ngx-cookie-service';
import { trigger, style, transition, animate }  from '@angular/animations';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('200ms ease-out', style({opacity: 0}))
      ])
    ])
  ],
})

export class ListOfProjectComponent implements OnChanges {
  @Input() projects: Project[];
  @Input() serverMessage: any;
  @Input() user: Observable<User>;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;
  serverMessageId: string;

  constructor (
    private modalService: ModalService,
    private errorService: ErrorService,
    private cookieService: CookieService) {

  }

  ngOnChanges() {
    this.serverMessageId = this.cookieService.get('serverMessageId');
  }

  dismiss() {
    this.serverMessageId = this.serverMessage.id;
    this.cookieService.set( 'serverMessageId', this.serverMessageId );
  }

  donate() {
    window.open('https://pendulums.io/donation.html', '_blank');
  }

  openCreateProjectModal() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: CreateProjectComponent,
        inputs: {
          currentUser: this.user
        }
      });
    } else {
      this.showError('Not available in offline mode');
    }
  }

  projectsTrackBy(index, project) {
    return project.id;
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
