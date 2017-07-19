import { Inject, Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { APP_CONFIG } from '../../app.config';
import {Project} from '../../shared/state/project/project.model';

@Injectable()
export class ProjectService {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

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
      .then(response => {
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
