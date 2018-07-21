import {Component, OnDestroy} from '@angular/core';
import { User }                 from '../shared/state/user/user.model';
import { Subscription }         from 'rxjs/Subscription';
import { AppState }             from '../shared/state/appState';
import { Store }                from '@ngrx/store';


@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.sass'],
})

export class NotFoundComponent implements OnDestroy {
  user: User;
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>) {
    this.subscriptions.push(store.select('user').subscribe((user: User) => {
      this.user = user;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }
}
