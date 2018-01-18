import { Injectable }                                     from '@angular/core';
import { Router, CanActivate,
  ActivatedRouteSnapshot, RouterStateSnapshot }    from '@angular/router';
import { Store }                                          from '@ngrx/store';
import { AppState }                                       from '../../../shared/state/appState';
import { Observable}                                      from 'rxjs/Observable';
import { User }                                           from '../../../shared/state/user/user.model';

@Injectable()
export class AnonymousGuardService implements CanActivate {
  private user: Observable<User>;
  private userId: string = null;

  constructor(private router: Router,
              private store: Store<AppState>) {
    this.user = store.select('user');
    this.user.subscribe((user: User) => {
      if (user) {
        this.userId = user.id;
      }
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userId) {
      // logged in so return true
      console.log('you are login!');
      this.router.navigate(['/dashboard']);
      return false;
    }

    // not logged in so redirect to login page with the return url and return false
    console.log('you are not login!')
    return true;
  }
}
