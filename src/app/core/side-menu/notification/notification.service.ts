import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG, AppConfig} from '../../../app.config';
import {Project} from '../../../shared/state/project/project.model';
import { SyncService } from '../../services/sync.service';

@Injectable()
export class NotificationService {
  private options;
  constructor(
    private http: HttpClient,
    private syncService: SyncService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

  accept(projectId): Promise<Project> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/accept-invitation' +
      '?socketId=' + this.syncService.getSocketId(), this.config.httpOptions)
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  deny(projectId): Promise<Project> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/deny-invitation' +
      '?socketId=' + this.syncService.getSocketId(), this.options)
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
