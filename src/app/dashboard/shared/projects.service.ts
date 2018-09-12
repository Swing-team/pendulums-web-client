import {Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG, AppConfig} from '../../app.config';
import {Project} from '../../shared/state/project/project.model';
import { SyncService } from '../../core/services/sync.service';

@Injectable()
export class ProjectService {
  private options;
  constructor(private http: HttpClient,
              private syncService: SyncService,
              @Inject(APP_CONFIG) private config: AppConfig) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

  create(project): Promise<Project> {
    return this.http
      .post(this.config.apiEndpoint + '/projects', project, {withCredentials: true})
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  getProject(projectId): Promise<any> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId, this.config.httpOptions)
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  update(project, projectId): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId, project, {withCredentials: true})
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  removeMember(projectId, userId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/team-members/' + userId +
      '?socketId=' + this.syncService.getSocketId(), this.options)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  inviteMember(projectId, invitedUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/invitation' +
      '?socketId=' + this.syncService.getSocketId(), JSON.stringify(invitedUser), this.options)
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  cancelInvitation(projectId, invitedUser): Promise<any> {
    const options = {
      withCredentials: true,
      body: JSON.stringify(invitedUser)
    };
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/invitation' +
      '?socketId=' + this.syncService.getSocketId(), options)
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  delete(projectId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId, this.options)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  changeTeamMemberRole(projectId, memberId, role) {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/roles' +
      '?socketId=' + this.syncService.getSocketId(),
        JSON.stringify({
          userWithRole: {
            id: memberId,
            role: role
          }
        }), this.options)
      .toPromise()
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
