import { Component, Input, OnInit }                           from '@angular/core';
import { Observable }                                 from 'rxjs/Observable';
import { ModalService }                               from '../../../core/modal/modal.service';
import { CreateProjectComponent }                     from '../create-project/create-project.component';
import { Project }                                    from '../../../shared/state/project/project.model';
import { Activity }                                   from '../../../shared/state/current-activity/current-activity.model';
import { Status }                                     from '../../../shared/state/status/status.model';
import { User }                                       from '../../../shared/state/user/user.model';
import { ErrorService }                               from '../../../core/error/error.service';
import { CookieService }                              from 'ngx-cookie-service';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent implements OnInit {
  @Input() projects: Observable<Project>;
  @Input() serverMessage: any;
  @Input() donation: String = 'active';
  @Input() user: Observable<User>;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;

  constructor (
    private modalService: ModalService,
    private errorService: ErrorService,
    private cookieService: CookieService) {

  }
  ngOnInit() {
    if (this.cookieService.get('donation') === 'deactive') {
      this.donation = 'deactive'
    }
  }
  dismiss() {
    this.donation = 'deactive'
    this.cookieService.set( 'donation', 'deactive' );
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
      this.showError('This feature is not available in offline mode');
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
