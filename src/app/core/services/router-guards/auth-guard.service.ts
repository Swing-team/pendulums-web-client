import { Injectable }                                     from '@angular/core';
import { Router, CanActivate,
         ActivatedRouteSnapshot, RouterStateSnapshot }    from '@angular/router';
import { Store }                                          from '@ngrx/store';
import { AppState }                                       from '../../../shared/state/appState';
import { Status }                                         from '../../../shared/state/status/status.model';
import { DatabaseService }                                from '../database/database.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  private isLogin: boolean = null;

  constructor(private router: Router,
              private store: Store<AppState>,
              private databaseService: DatabaseService) {
    store.select('status').subscribe((status: Status) => {
      if (status) {
        this.isLogin = status.isLogin;
      } else {
        this.isLogin = null;
      }
    });
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isLogin === false) {
      // not logged in so redirect to login page with the return url and return false
      this.router.navigate(['/signIn']);
      return false;
    } else if (this.isLogin === null) {
      const data = await this.databaseService.getAll('activeUser');
      if (data.length > 0) {
        return true;
      } else {
        this.router.navigate(['/signIn']);
        return false;
      }
    } else {
      return true;
    }
  }
}
