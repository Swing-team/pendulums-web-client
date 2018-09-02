import { Injectable } from '@angular/core';

@Injectable()
export class NativeNotificationService {

  constructor() {}

  showNotification(message: string) {
    // check that browser support notification or not
    if (!('Notification' in window)) {
      alert(message);
      console.log('your browser dose not support notification');
    } else {
      const _Notification = window['Notification'];
      if (_Notification.permission === 'granted') {
        const notification = new _Notification(message);

      } else if (_Notification.permission !== 'denied' || _Notification.permission === 'default') {
        _Notification.requestPermission((permission) => {
          if (permission === 'granted') {
            const notification = new _Notification(message);
          }
        });
      }
    }
  }

  getPermission() {
    if ('Notification' in window) {
      const _Notification = window['Notification'];
      if ((_Notification.permission !== 'denied' || _Notification.permission === 'default') &&
       _Notification.permission !== 'granted') {
        _Notification.requestPermission();
       }
    }
  }
}
