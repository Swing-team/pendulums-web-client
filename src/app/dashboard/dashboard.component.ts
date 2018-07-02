import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import {Component, OnDestroy} from '@angular/core';
import { Observable }               from 'rxjs/Observable';
import { Store }                    from '@ngrx/store';
import { AppState }                 from '../shared/state/appState';
import { AppStateSelectors }        from '../shared/state/app-state.selectors';
import { Router, RoutesRecognized } from '@angular/router';
import { UserService }              from '../core/services/user.service';
import { ProjectsActions }          from '../shared/state/project/projects.actions';
import { Subscription }             from 'rxjs/Subscription';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnDestroy{
  projects: Observable<any>;
  user: Observable<any>;
  currentActivity: Observable<any>;
  status: Observable<any>;
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>,
               appStateSelectors: AppStateSelectors,
               private router: Router,
               private userService: UserService,
               private projectsActions: ProjectsActions) {

    this.subscriptions.push(
      this.router.events
        .filter(e => e instanceof RoutesRecognized)
        .pairwise()
        .subscribe((e: any) => {
          if (e[1].url === '/dashboard' && (e[0].url.startsWith('/activities') || e[0].url.startsWith('/profile'))) {
            this.userService.getSummary()
              .then((user) => {
                this.store.dispatch(this.projectsActions.loadProjects(user.projects));
              })
              .catch(error => {
                console.log('error:', error)
              })
          }
        })
    );

    this.currentActivity = store.select('currentActivity');
    this.user = store.select('user');
    this.status = store.select('status');
    this.projects = store.select(appStateSelectors.getProjectsArray);
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }
}


