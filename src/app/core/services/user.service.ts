import { Injectable }         from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { User }               from '../../shared/state/user/user.model';
import { environment }        from '../../../environments/environment';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
  constructor(
    private http: HttpClient
  ) { }

  getSummary(): Promise<any> {
    return this.http
      .get(environment.apiEndpoint + '/user/summary', environment.httpOptions)
      .toPromise()
      .then(response => (response as any).user as User)
      .catch(this.handleError);
  }

  update(user): Promise<any> {
    return this.http
      .put(environment.apiEndpoint + '/user' , user, environment.httpOptions)
      .toPromise()
      .then(response => (response as any).user as User)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
