import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { APP_CONFIG } from '../../app.config';
import {Activity} from "../state/current-activity/current-activity.model";

@Injectable()
export class ActivityService {
  constructor(
    private http: Http,
    @Inject(APP_CONFIG) private config
  ) { }

  create(projectId, activity): Promise<any> {
    return this.http
      .post(this.config.apiEndpoint + '/projects/' + projectId + '/activities' ,
        JSON.stringify({activity: activity}) , this.config.httpOptions)
      .toPromise()
      .then(response => response.json() as Activity)
      .catch(this.handleError);
  }

  editCurrentActivity(projectId, activity): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/activities/current/' + activity.id ,
        JSON.stringify({activity: activity}),
        this.config.httpOptions)
      .toPromise()
      .then(response => response.json() as Activity)
      .catch(this.handleError);
  }

  editOldActivity(projectId, activity): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/projects/' + projectId + '/activities/old/' + activity.id ,
        JSON.stringify({activity: activity}),
        this.config.httpOptions)
      .toPromise()
      .then(response => response.json() as Activity)
      .catch(this.handleError);
  }

  getActivities(projectId , page?: number): Promise<Activity[]> {
    return this.http
      .get(this.config.apiEndpoint + '/projects/' + projectId + '/activities' , {withCredentials: true, params: { page: page}})
      .toPromise()
      .then(response => response.json() as Activity [])
      .catch(this.handleError);
  }

  delete(projectId, activityId): Promise<any> {
    return this.http
      .delete(this.config.apiEndpoint + '/projects/' + projectId + '/activities/' + activityId , this.config.httpOptions)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
