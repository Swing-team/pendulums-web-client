import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { AppState } from './shared/state/appState';
import { UserActions } from './shared/state/user/user.actions';

import { AuthenticationService } from './core/authentication.service';
import { UserService } from './core/user.service';
import {ProjectsActions} from './shared/state/project/projects.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  private user: Observable<any>;
  private projects: Observable<any>;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private userActions: UserActions,
    private projectsActions: ProjectsActions,
    private store: Store<AppState>
  ) {
    this.user = store.select('user');
    this.projects = store.select('projects');
  }

  ngOnInit(): void {
    this.userService.getSummary()
      .then((user) => {
        this.store.dispatch(this.userActions.loadUser(user));
        this.store.dispatch(this.projectsActions.loadProjects(user.projects));
        this.router.navigate(['dashboard']);
      })
      .catch(error => {
        console.log('error is: ', error);
      });
  }

  signOut() {
    this.authService.signOut()
      .then(() => {
        this.store.dispatch(this.userActions.clearUser());
        this.store.dispatch(this.projectsActions.clearProjects());
        this.router.navigate(['signIn']);
      });
  }
}


