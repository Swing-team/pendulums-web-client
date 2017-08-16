import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { APP_CONFIG } from '../../app.config';

@Injectable()
export class ActivityService {
  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

  create(projectId, activity): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/activities' , activity , {withCredentials: true})
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  edit(projectId, activity): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/activities/' + activity.id ,
        JSON.stringify({activity: activity}),
        {withCredentials: true})
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
