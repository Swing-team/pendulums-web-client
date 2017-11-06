import { Inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import {APP_CONFIG, AppConfig} from '../../app.config';
import {Activity}             from '../../shared/state/current-activity/current-activity.model';

@Injectable()
export class ActivityService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) { }

  create(projectId, activity): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/activities' ,
        JSON.stringify({activity: activity}) , this.config.httpOptions)
      .toPromise()
      .then(response => response as Activity)
      .catch(this.handleError);
  }

  createManually(projectId, activity): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/activities/manualActivity' ,
        JSON.stringify({activity: activity}) , this.config.httpOptions)
      .toPromise()
      .then(response => response as Activity)
      .catch(this.handleError);
  }

  editCurrentActivity(projectId, activity): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/activities/current/' + activity.id ,
        JSON.stringify({activity: activity}),
        this.config.httpOptions)
      .toPromise()
      .then(response => response as Activity)
      .catch(this.handleError);
  }

  editOldActivity(projectId, activity): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/activities/old/' + activity.id ,
        JSON.stringify({activity: activity}),
        this.config.httpOptions)
      .toPromise()
      .then(response => response as Activity)
      .catch(this.handleError);
  }

  getActivities(projectId , page: number = 0): Promise<Activity[]> {
    const httpParams = new HttpParams();
    httpParams.set('page', page.toString());
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/activities' ,
        {...this.config.httpOptions, params: httpParams})
      .toPromise()
      .then(response => response as Activity[])
      .catch(this.handleError);
  }

  delete(projectId, activityId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/activities/' + activityId , this.config.httpOptions)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
