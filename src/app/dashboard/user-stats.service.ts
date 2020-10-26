import { Injectable }                 from '@angular/core';
import { HttpClient, HttpParams }     from '@angular/common/http';
import { environment }                from '../../environments/environment';

@Injectable()
export class UserStatsService {
  constructor(
    private http: HttpClient,
  ) { }

  getUserStats(fromDate, toDate): Promise<{result: {_id: string, value: number}[], columnSize: number}> {
    const httpParams = new HttpParams()
      .set('from', JSON.stringify(fromDate))
      .set('to', JSON.stringify(toDate));
    const optionsWithParams = {...environment.httpOptions, params: httpParams};
    return this.http
      .get(environment.apiEndpoint + '/user/stats/hours', optionsWithParams)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
