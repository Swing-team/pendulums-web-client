import { Injectable } from '@angular/core';

@Injectable()
export class LocalNotificationService {

  constructor() {}

  showNotification(title: string, message: string) {
    // check if deviceready event has already fired
    if (window['cordova'] && window['cordova'].plugins && window['cordova'].plugins.notification) {
      window['cordova'].plugins.notification.local.schedule({
        title: title,
        text: message,
        foreground: true,
        icon: 'res://app_icon_round.png',
        smallIcon: 'res://app_small_icon.png'
      });
    }
  }

  getPermission() {
    // check if deviceready event has already fired
    if (window['cordova'] && window['cordova'].plugins && window['cordova'].plugins.notification) {
      window['cordova'].plugins.notification.local.hasPermission((granted) => {
        console.log('Notification permission status: ' + granted);
        if (!granted) {
          window['cordova'].plugins.notification.local.requestPermission(
            (newGranted) => console.log('New notification permission status: ' + newGranted)
          );
        }
      });
    }
  }
}
