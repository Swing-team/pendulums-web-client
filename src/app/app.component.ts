import {Component, OnInit} from '@angular/core';
import {UserService} from './shared/user.service';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {AppState} from './shared/state/appState';
import {UserActions} from './shared/state/user/user.actions';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  private user: Observable<any>;

  constructor(private router: Router,
              private userService: UserService,
              private userActions: UserActions,
              private store: Store<AppState>) {
    this.user = store.select('user');
  }

  ngOnInit(): void {
    this.userService.getSummary()
      .then((user) => {
        this.router.navigate(['dashboard']);
        this.store.dispatch(this.userActions.loadUser(user));
      })
      .catch(error => {
        console.log('error is: ', error);
      });
  }
}


