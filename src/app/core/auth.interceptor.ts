import 'rxjs/add/operator/do';
import {
  HttpErrorResponse, HttpEvent, HttpHandler,
  HttpInterceptor, HttpRequest, HttpResponse
}                                                  from '@angular/common/http';
import { Injectable }                              from '@angular/core';
import { Observable }                              from 'rxjs/Observable';
import {AuthenticationService}                     from './services/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response
      }
    }, (error: any) => {
      if (error instanceof HttpErrorResponse) {
        if ((error.status === 401 || error.status === 403)
          && (window.location.href.match(/\?/g) || []).length < 2) {
            console.log('The authentication session expires or the user is not authorised. Force refresh of the current page.');
          this.authService.signOut()
            .then(() => {});
        }
      }
    });
  }
}
