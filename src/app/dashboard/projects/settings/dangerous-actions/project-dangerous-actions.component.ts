import { Component, Input }           from '@angular/core';
import { Project }                    from '../../../../shared/state/project/project.model';
import { ProjectService }             from '../../../shared/projects.service';
import { AppState }                   from '../../../../shared/state/appState';
import { Store }                      from '@ngrx/store';
import { ProjectsActions }            from '../../../../shared/state/project/projects.actions';
import { ErrorService }               from '../../../../core/error/error.service';

@Component({
  selector: 'dangerous-actions',
  templateUrl: './project-dangerous-actions.component.html',
  styleUrls: ['./project-dangerous-actions.component.sass']
})

export class DangerousActionsComponent {
  @Input() project: Project;
  @Input() readOnly: boolean;
  @Input() isOwner: boolean;
  @Input() isAdmin: boolean;
  projectNameInput: String;

  constructor(
    private projectService: ProjectService,
    private store: Store<AppState>,
    private projectsAction: ProjectsActions,
    private errorService: ErrorService) {
  }

  confirm() {
    if (this.projectNameInput.valueOf() === this.project.name.valueOf()) {
      console.log('deletion confirmed');
      this.projectService.delete(this.project.id)
        .then(response => {
          this.store.dispatch(this.projectsAction.removeProject(this.project));
          this.showError('Project deleted successfully.');
        })
        .catch(error => {
          this.showError('Server communication error.');
        });
    } else {
      console.log('deletion ignored');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}

