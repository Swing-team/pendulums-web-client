import { Component, Inject }    from '@angular/core';
import { APP_CONFIG }           from '../app.config';
import { User }                 from '../shared/state/user/user.model';
import { Subscription }         from 'rxjs/Subscription';
import { AppState }             from '../shared/state/appState';
import { Store }                from '@ngrx/store';


@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.sass'],
})

export class NotFoundComponent {
  user: User;
  private subscriptions: Array<Subscription> = [];

  constructor (@Inject(APP_CONFIG) private config,
               private store: Store<AppState>) {
    this.subscriptions.push(store.select('user').subscribe((user: User) => {
      this.user = user;
    }));
  }
}
