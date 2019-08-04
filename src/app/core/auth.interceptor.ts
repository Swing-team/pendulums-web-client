import 'rxjs/add/operator/do';
import {
  HttpErrorResponse, HttpEvent, HttpHandler,
  HttpInterceptor, HttpRequest, HttpResponse
}                                             from '@angular/common/http';
import { Injectable }                         from '@angular/core';
import { Observable }                         from 'rxjs/Observable';
import { Store }                              from '@ngrx/store';
import { StatusActions }                      from '../shared/state/status/status.actions';
import { AppState }                           from '../shared/state/appState';
import { Router }                             from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<AppState>,
              private statusActions: StatusActions,
              private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response
      }
    }, (error: any) => {
      if (error instanceof HttpErrorResponse) {
        if ((error.status === 403) && (window.location.href.match(/\?/g) || []).length < 2) {
          console.log('The authentication session expires or the user is not authorized. Force refresh of the current page.');
          this.store.dispatch(this.statusActions.updateIsLogin(false));
        } else if (error.status === 401) {
          this.router.navigate(['dashboard']);
        }
      }
    });
  }
}
