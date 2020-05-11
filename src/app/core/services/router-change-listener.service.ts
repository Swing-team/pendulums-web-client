import { pairwise, filter } from 'rxjs/operators';
import { Subscription }             from 'rxjs';
import { Injectable }               from '@angular/core';
import { Store }                    from '@ngrx/store';
import { Router, RoutesRecognized } from '@angular/router';
import { UserService }              from './user.service';
import { AppState }                 from '../../shared/state/appState';
import { ProjectsActions }          from '../../shared/state/project/projects.actions';

@Injectable()
export class RouterChangeListenerService {
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>,
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
  }
}


