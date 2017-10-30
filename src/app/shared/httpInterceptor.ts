import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Request, XHRBackend, RequestOptions,
         Response, Http, RequestOptionsArgs }      from '@angular/http';
import { Injectable }                              from '@angular/core';
import { Observable }                              from 'rxjs/Observable';
import { Router }                                  from '@angular/router';

@Injectable()
export class HttpInterceptor extends Http {

  constructor(backend: XHRBackend,
              defaultOptions: RequestOptions,
              private router: Router) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((error: Response) => {
      if ((error.status === 401 || error.status === 403) && (window.location.href.match(/\?/g) || []).length < 2) {
        console.log('The authentication session expires or the user is not authorised. Force refresh of the current page.');
        this.router.navigate(['signIn']);
      }
      return Observable.throw(error);
    });
  }
}
