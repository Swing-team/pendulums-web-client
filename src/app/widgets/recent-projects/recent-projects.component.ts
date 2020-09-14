import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/shared/state/project/project.model';
import { User } from 'app/shared/state/user/user.model';
import { Status } from 'app/shared/state/status/status.model';
import { CreateProjectComponent } from 'app/project/create-project/create-project.component';
import { ModalService } from 'app/core/modal/modal.service';
import { ErrorService } from 'app/core/error/error.service';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'recent-projects',
  templateUrl: './recent-projects.component.html',
  styleUrls: ['./recent-projects.component.sass'],
})

export class RecentProjectsComponent implements OnInit {
  @Input() projects: Project[];
  @Input() user: User;
  @Input() status: Status;
  @Input() currentActivity$: Observable<Activity>;

  constructor(
    private modalService: ModalService,
    private errorService: ErrorService,
  ) { }

  ngOnInit() { }

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

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}