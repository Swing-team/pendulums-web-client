import { Injectable }                 from '@angular/core';
import { StopStartActivityService }   from '../core/services/stop-start-activity.service';
import { Store }                      from '@ngrx/store';
import { AppState }                   from '../shared/state/appState';
import { AppStateSelectors }          from '../shared/state/app-state.selectors';
import { User } from 'app/shared/state/user/user.model';
import { LocalNotificationService } from './local-notification.mobile.service';
import { Location } from '@angular/common';

@Injectable()
export class RestTimeTrackingService {
  showNotifInterval: any;
  user: User;
  isListeningBack = false;
  backListenerFunction = this.moveAppToBackground.bind(this);

  constructor(
    private stopStartActivityService: StopStartActivityService,
    private store: Store<AppState>,
    private appStateSelectors: AppStateSelectors,
    private localNotificationService: LocalNotificationService,
    private location: Location,
  ) {
    // TODO: Mohammad 04-12-2019: add notification action to stop activity
    this.store.select('user').subscribe((user) => {
      if (this.user && !this.user.settings.relaxationTime.isEnabled && user.settings.relaxationTime.isEnabled) {
        this.localNotificationService.getPermission();
      } else if (this.showNotifInterval && this.user
        && this.user.settings.relaxationTime.isEnabled && !user.settings.relaxationTime.isEnabled) {
        clearInterval(this.showNotifInterval);
      }
      this.user = user;
    });

    document.addEventListener('deviceready', () => {
      this.store.select('currentActivity').subscribe((currentActivity) => {
        if (currentActivity.startedAt) {
          const settings = this.user.settings;
          window['cordova'].plugins.backgroundMode.on('activate', function() {
            window['cordova'].plugins.backgroundMode.disableWebViewOptimizations();
          });
          window['cordova'].plugins.backgroundMode.enable();
          window['cordova'].plugins.backgroundMode.setDefaults(this.getCurrentActivityNotificationConfig(currentActivity));
          if (!this.isListeningBack) {
            document.addEventListener('backbutton', this.backListenerFunction, false);
            this.isListeningBack = true;
          }

          const workTime = Math.floor(settings.relaxationTime.workingTime / 1000);
          const restTime = Math.floor(settings.relaxationTime.restTime / 1000);
          let nextWorkTime = workTime;

          if (this.showNotifInterval) {
            clearInterval(this.showNotifInterval);
          }
          this.showNotifInterval = setInterval(() => {
            window['cordova'].plugins.backgroundMode.configure(this.getCurrentActivityNotificationConfig(currentActivity));
            if (settings.relaxationTime.isEnabled) {
              const duration = Math.floor((Date.now() - Number(currentActivity.startedAt)) / 1000);
              if (duration === nextWorkTime) {
                this.localNotificationService.showNotification('Take a rest!', `Take a rest and be relaxed for ${restTime / 60} minutes!`);
              }
              if (duration === (nextWorkTime + restTime)) {
                this.localNotificationService.showNotification('Start to work!', `Ok! It's time to work for next ${workTime / 60} minutes!`);
                nextWorkTime += (workTime + restTime);
              }
            }
          }, 1000)
        } else {
          if (this.showNotifInterval) {
            clearInterval(this.showNotifInterval);
          }
          // check if deviceready event has already fired
          if (window['cordova']) {
            window['cordova'].plugins.backgroundMode.disable();
            document.removeEventListener('backbutton', this.backListenerFunction, false);
            this.isListeningBack = false;
          }
        }
      });
    }, false);
  }

  getCurrentActivityNotificationConfig(currentActivity) {
    const startedAt = Number(currentActivity.startedAt);
    const now = Date.now();
    const timeDuration = this.getTime(now - startedAt);
    return {
      title: currentActivity.name,
      text: timeDuration,
      icon: 'app_small_icon',
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

  private moveAppToBackground() {
    if ((this.location.path() === '/dashboard') && (document.getElementsByTagName('modal').length === 0)) {
      window['cordova'].plugins.backgroundMode.moveToBackground();
    } else {
      this.location.back();
    }
  }
}
