import { Component, Input, OnInit }           from '@angular/core';
import { Store }                      from '@ngrx/store';
import { TeamMember } from 'app/shared/state/team-member/team-member.model';
import { Project } from 'app/shared/state/project/project.model';
import { ProjectService } from 'app/project/project.service';
import { AppState } from 'app/shared/state/appState';
import { ProjectsActions } from 'app/shared/state/project/projects.actions';
import { ErrorService } from 'app/core/error/error.service';
import { ModalService } from 'app/core/modal/modal.service';
import { CurrentActivityActions } from 'app/shared/state/current-activity/current-activity.actions';

@Component({
  selector: 'dangerous-actions',
  templateUrl: './project-dangerous-actions.component.html',
  styleUrls: ['./project-dangerous-actions.component.sass']
})

export class DangerousActionsComponent implements OnInit {
  @Input() project: Project;
  @Input() readOnly: boolean;
  @Input() isOwner: boolean;
  @Input() isAdmin: boolean;
  @Input() projectIdInCurrentActivity: string;
  projectNameInput: String;
  deleteConfirmation = false;
  deleteButtonDisabled = false;
  leaveConfirmation = false;
  leaveButtonDisabled = false;
  newOwnerId: string;
  membersWithoutOwner: TeamMember[];

  constructor(
    private projectService: ProjectService,
    private store: Store<AppState>,
    private projectsAction: ProjectsActions,
    private errorService: ErrorService,
    private modalService: ModalService,
    private currentActivityActions: CurrentActivityActions) {
  }

  ngOnInit() {
    this.membersWithoutOwner = this.project.teamMembers.filter(t => t.id !== this.project.owner.id);
  }

  confirmToDelete() {
    if (this.projectNameInput === this.project.name) {
      this.deleteConfirmation = true;
    } else {
      this.showError('Project name mismatch.');
    }
  }

  cancelDelete() {
    this.deleteConfirmation = false;
  }

  confirmFinalDelete() {
    if (this.projectNameInput === this.project.name) {
      if (!this.deleteButtonDisabled) {
        this.deleteButtonDisabled = true;
        if (this.projectNameInput.valueOf() === this.project.name.valueOf()) {
          this.projectService.delete(this.project.id)
            .then(response => {
              this.store.dispatch(this.projectsAction.removeProject(this.project.id));
              this.showError('The project was deleted successfully');

              // if we have current activity on deleted project we should clear it
              if (this.project.id === this.projectIdInCurrentActivity) {
                this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
              }

              this.deleteButtonDisabled = false;
              this.modalService.close();
            })
            .catch(error => {
              this.deleteButtonDisabled = false;
              this.showError('Server communication error');
            });
        }
      }
    } else {
      this.showError('Project name mismatch.');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

  confirmToLeave() {
    if ((this.isOwner && this.newOwnerId) || !this.isOwner) {
      this.leaveConfirmation = true;
    } else {
      this.showError('Select a member as the new project owner.');
    }
  }

  cancelLeave() {
    this.leaveConfirmation = false;
  }

  leaveProject() {
    if (!this.leaveButtonDisabled) {
      this.leaveButtonDisabled = true;
      this.projectService.leaveProject(this.project.id, this.newOwnerId).then(response => {
        this.store.dispatch(this.projectsAction.removeProject(this.project.id));
        this.showError('The project was left successfully');

        // if we have current activity on left project we should clear it
        if (this.project.id === this.projectIdInCurrentActivity) {
          this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        }

        this.leaveButtonDisabled = false;
        this.modalService.close();
      }).catch(error => {
        this.leaveButtonDisabled = false;
        this.showError('Server communication error');
      });
    }

  }
}

