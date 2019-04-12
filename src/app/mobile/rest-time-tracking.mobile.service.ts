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
      } else if (this.showNotifInterval && this.user
        && this.user.settings.relaxationTime.isEnabled && !user.settings.relaxationTime.isEnabled) {
        clearInterval(this.showNotifInterval);
      }
      this.user = user;
    });

    this.store.select('currentActivity').subscribe((currentActivity) => {
      if (currentActivity.startedAt) {
        // FIXME: Mohammad 04-12-2019: uncomment these when it's fixed: https://github.com/katzer/cordova-plugin-background-mode/issues/393
        //window['cordova'].plugins.backgroundMode.enable();
        //window['cordova'].plugins.backgroundMode.setDefaults(this.getCurrentActivityNotificationConfig(currentActivity));

        if (this.user.settings.relaxationTime.isEnabled) {
          const settings = this.user.settings;
          const workTime = Math.floor(settings.relaxationTime.workingTime / 1000);
          const restTime = Math.floor(settings.relaxationTime.restTime / 1000);

          let nextWorkTime = workTime;

          if (this.showNotifInterval) {
            clearInterval(this.showNotifInterval);
          }
          this.showNotifInterval = setInterval(() => {
            //window['cordova'].plugins.backgroundMode.configure(this.getCurrentActivityNotificationConfig(currentActivity));
            const duration = Math.floor((Date.now() - Number(currentActivity.startedAt)) / 1000);
            if (duration === nextWorkTime) {
              this.localNotificationService.showNotification('Take a rest!', `You need to rest for ${restTime / 60} minutes.`);
            }
            if (duration === (nextWorkTime + restTime)) {
              this.localNotificationService.showNotification('Start to work!', `You need to do work for ${workTime / 60} minutes`);
              nextWorkTime += (workTime + restTime);
            }
          }, 1000)
        }
      } else {
        if (this.showNotifInterval) {
          clearInterval(this.showNotifInterval);
        }
        // check if deviceready event has already fired
        //if (window['cordova']) {
          //window['cordova'].plugins.backgroundMode.disable();
        //}
      }
    });
  }

  getCurrentActivityNotificationConfig(currentActivity) {
    const startedAt = Number(currentActivity.startedAt);
    const now = Date.now();
    const timeDuration = this.getTime(now - startedAt);
    return {
      title: currentActivity.name,
      text: timeDuration,
      icon: 'app_small_icon.png',
      color: '46476F',
      bigText: true
    };
  }

  getTime(duration) {
    let result = '';
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    let tempMinutes = '' ;
    let tempSeconds = '' ;
    let tempHours = '' ;
    if (minutes < 10) {
      tempMinutes = '0' + minutes;
    } else {
      tempMinutes = '' + minutes;
    }
    if (seconds < 10) {
      tempSeconds = '0' + seconds;
    } else {
      tempSeconds = '' + seconds;
    }
    if (hours < 10) {
      tempHours = '0' + hours;
    } else {
      tempHours = '' + hours;
    }

    result = tempHours + ':' + tempMinutes + ':' + tempSeconds;

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  }
}
