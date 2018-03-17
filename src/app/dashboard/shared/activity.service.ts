import { Inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import {APP_CONFIG, AppConfig} from '../../app.config';
import {Activity}             from '../../shared/state/current-activity/current-activity.model';

@Injectable()
export class ActivityService {
  private options;
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this.options = {...this.config.httpOptions, responseType: 'text'};
  }

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
    const httpParams = new HttpParams()
      .set('page', page.toString());
    const optionsWithParams = {...this.config.httpOptions, params: httpParams};
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/activities', optionsWithParams)
      .toPromise()
      .then(response => response as Activity[])
      .catch(this.handleError);
  }

  getStat(projectId, users, fromDate, toDate): Promise<any> {
    const httpParams = new HttpParams()
      .set('users', JSON.stringify(users))
      .set('from', JSON.stringify(fromDate))
      .set('to', JSON.stringify(toDate));
    const optionsWithParams = {...this.config.httpOptions, params: httpParams};
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/stats/hours', optionsWithParams)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  delete(projectId, activityId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/activities/' + activityId , this.options)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
