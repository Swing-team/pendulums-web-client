import { Injectable }                 from '@angular/core';
import { StopStartActivityService }   from '../core/services/stop-start-activity.service';
import { Store }                      from '@ngrx/store';
import { AppState }                   from '../shared/state/appState';
import { AppStateSelectors }          from '../shared/state/app-state.selectors';
import { User } from 'app/shared/state/user/user.model';
import { LocalNotificationService } from './local-notification.mobile.service';

@Injectable()
export class RestTimeTrackingService {
  showNotifInterval: any;
  user: User;

  constructor(
    // TODO: Mohammad 04-12-2019: add notification action to stop activity
    private stopStartActivityService: StopStartActivityService,
    private store: Store<AppState>,
    private appStateSelectors: AppStateSelectors,
    private localNotificationService: LocalNotificationService
  ) {
    this.store.select('user').subscribe((user) => {
      if (this.user && !this.user.settings.relaxationTime.isEnabled && user.settings.relaxationTime.isEnabled) {
        this.localNotificationService.getPermission();
      }
      this.user = user;
    });

    this.store.select('currentActivity').subscribe((currentActivity) => {
      if (currentActivity.startedAt) {
        const settings = this.user.settings;
        const workTime = Math.floor(settings.relaxationTime.workingTime / 1000);
        const restTime = Math.floor(settings.relaxationTime.restTime / 1000);

        let nextWorkTime = workTime;

        if (this.showNotifInterval) {
          clearInterval(this.showNotifInterval);
        }
        this.showNotifInterval = setInterval(() => {
          const duration = Math.floor((Date.now() - Number(currentActivity.startedAt)) / 1000);
          if (duration === nextWorkTime) {
            this.localNotificationService.showNotification('Take a rest!', `You need to rest for ${restTime / 60} minutes.`);
          }
          if (duration === (nextWorkTime + restTime)) {
            this.localNotificationService.showNotification('Start to work!', `You need to do work for ${workTime / 60} minutes`);
            nextWorkTime += (workTime + restTime);
          }
        }, 1000)
      } else {
        if (this.showNotifInterval) {
          clearInterval(this.showNotifInterval);
        }
      }
    });
  }
}
