import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import {APP_CONFIG, AppConfig} from '../../../app.config';
import {Project} from '../../../shared/state/project/project.model';

@Injectable()
export class NotificationService {
  private options;
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

  accept(projectId): Promise<Project> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/accept-invitation', this.config.httpOptions)
      .toPromise()
      .then(response => response as Project)
      .catch(this.handleError);
  }

  deny(projectId): Promise<Project> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/deny-invitation', this.options)
      .toPromise()
      .then(response => projectId)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
