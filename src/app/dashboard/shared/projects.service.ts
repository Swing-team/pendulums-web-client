import {Inject, Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG} from '../../app.config';
import {Project} from '../../shared/state/project/project.model';

@Injectable()
export class ProjectService {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http,
              @Inject(APP_CONFIG) private config) {
  }

  create(project): Promise<Project> {
    return this.http
      .post(this.config.apiEndpoint + '/projects', project, {withCredentials: true})
      .toPromise()
      .then(response => response.json() as Project)
      .catch(this.handleError);
  }

  update(project, projectId): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId, project, {withCredentials: true})
      .toPromise()
      .then(response => response.json() as Project)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }

  removeMember(projectId, userId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/team-members/' + userId)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  inviteMember(projectId, invitedUser): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/invitation',
        JSON.stringify(invitedUser), {withCredentials: true}
      )
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  cancelInvitation(projectId, invitedUser): Promise<any> {
    const options = new RequestOptions({
      withCredentials: true,
      body: JSON.stringify(invitedUser)
    });
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/invitation',
        options)
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  delete(projectId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId, {withCredentials: true})
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  changeTeamMemberRole(projectId, memberId, role) {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/roles',
        JSON.stringify({
          userWithRole: {
            id: memberId,
            role: role
          }
        }), {withCredentials: true})
      .toPromise()
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }
}
