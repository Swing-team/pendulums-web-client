import { Component, Input, OnChanges }                from '@angular/core';
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
import { AppState } from 'app/shared/state/appState';
import { Store } from '@ngrx/store';
import { ProjectsActions } from 'app/shared/state/project/projects.actions';

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
  @Input() sortBy: string;
  @Input() serverMessage: any;
  @Input() user: Observable<User>;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;
  serverMessageId: string;
  sortOptions = [
    {name: 'Sort by date (ascending)', value: '+date'},
    {name: 'Sort by date (descending)', value: '-date'},
    {name: 'Sort by name (ascending)', value: '+name'},
    {name: 'Sort by name (descending)', value: '-name'},
    {name: 'Sort by recent activity (ascending)', value: '+activity'},
    {name: 'Sort by recent activity (descending)', value: '-activity'}
  ]
  sortByItemIndex: number;

  constructor (
    private modalService: ModalService,
    private errorService: ErrorService,
    private cookieService: CookieService,
    private store: Store<AppState>,
    private projectsActions: ProjectsActions) {

  }

  ngOnChanges() {
    this.serverMessageId = this.cookieService.get('serverMessageId');
    this.sortByItemIndex = this.sortOptions.findIndex(sortOption => sortOption.value === this.sortBy);
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

  sort(event) {
    this.store.dispatch(this.projectsActions.updateSortBy(event.selectedItem.value));
  }
}
