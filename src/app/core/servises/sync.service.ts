import 'rxjs/add/operator/toPromise';
import { Inject, Injectable }           from '@angular/core';
import { Http }                         from '@angular/http';
import { APP_CONFIG }                   from '../../app.config';

@Injectable()
export class SyncService {
  constructor(private http: Http,
              @Inject(APP_CONFIG) private config) {
  }

  syncData(data): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/sync/activities', JSON.stringify(data), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('Offline activities has been sync with server successfully :)'))
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
