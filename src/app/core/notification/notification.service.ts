import { Injectable }       from '@angular/core';
import { HttpClient }       from '@angular/common/http';
import { Project }          from '../../shared/state/project/project.model';
import { SocketService }      from '../services/socket.service';
import { environment }      from '../../../environments/environment';


@Injectable()
export class NotificationService {
  private options;
  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    this.options = {...environment.httpOptions, responseType: 'text'};
  }

  accept(projectId): Promise<Project> {
    return this.http
      .get(environment.apiEndpoint + '/projects/' + projectId + '/accept-invitation' +
      '?socketId=' + this.socketService.getSocketId(), environment.httpOptions)
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  deny(projectId): Promise<Project> {
    return this.http
      .get(environment.apiEndpoint + '/projects/' + projectId + '/deny-invitation' +
      '?socketId=' + this.socketService.getSocketId(), this.options)
      .toPromise()
      .then(response => projectId)
      .catch(this.handleError);
  }

  // TODO: add somthing to get notifications in here service or in state
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
