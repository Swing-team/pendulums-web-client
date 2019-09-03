import { Injectable}            from '@angular/core';
import { HttpClient }           from '@angular/common/http';
import { Project }              from '../../shared/state/project/project.model';
import { SocketService }        from '../../core/services/socket.service';
import { environment }          from '../../../environments/environment';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class ProjectService {
  private options;
  constructor(private http: HttpClient,
              private socketService: SocketService) {
    this.options = {...environment.httpOptions, responseType: 'text'};
  }

  create(project): Promise<Project> {
    return this.http
      .post(environment.apiEndpoint + '/projects', project, {withCredentials: true})
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  getProject(projectId): Promise<any> {
    return this.http
      .get(environment.apiEndpoint + '/projects/' + projectId, environment.httpOptions)
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  update(project, projectId): Promise<any> {
    return this.http
      .put(environment.apiEndpoint + '/projects/' + projectId, project, {withCredentials: true})
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  removeMember(projectId, userId): Promise<any> {
    return this.http
      .delete(environment.apiEndpoint + '/projects/' + projectId + '/team-members/' + userId +
      '?socketId=' + this.socketService.getSocketId(), this.options)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  inviteMember(projectId, invitedUser): Promise<any> {
    return this.http
      .post(environment.apiEndpoint + '/projects/' + projectId + '/invitation' +
      '?socketId=' + this.socketService.getSocketId(), JSON.stringify(invitedUser), this.options)
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
      .delete(environment.apiEndpoint + '/projects/' + projectId + '/invitation' +
      '?socketId=' + this.socketService.getSocketId(), options)
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  delete(projectId): Promise<any> {
    return this.http
      .delete(environment.apiEndpoint + '/projects/' + projectId, this.options)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  changeTeamMemberRole(projectId, memberId, role) {
    return this.http
      .put(environment.apiEndpoint + '/projects/' + projectId + '/roles' +
      '?socketId=' + this.socketService.getSocketId(),
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

  leaveProject(projectId: string, newOwnerId?: string) {
    const options = {
      withCredentials: true,
      body: JSON.stringify({newOwnerId})
    };
    return this.http
      .delete(environment.apiEndpoint + '/projects/' + projectId + '/team-members/leave' +
        '?socketId=' + this.syncService.getSocketId(), options)
      .toPromise()
      .then(response => {

      }).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
