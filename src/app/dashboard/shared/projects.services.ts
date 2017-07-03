import { Inject, Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { APP_CONFIG } from '../../app.config';

@Injectable()
export class ProjectServices {
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(
    private http: Http, @Inject(APP_CONFIG) private config) { }

  create(project): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects', project, {withCredentials: true})
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
