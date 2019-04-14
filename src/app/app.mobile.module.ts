import { APP_INITIALIZER, NgModule }  from '@angular/core';
import { AppModuleConfig }            from './app.module.config';
import { LocalNotificationService }            from './mobile/local-notification.mobile.service';
import { RestTimeTrackingService }            from './mobile/rest-time-tracking.mobile.service';

@NgModule({
    declarations: AppModuleConfig.declarations,
    imports: AppModuleConfig.imports,
    providers: [
      ...AppModuleConfig.providers,
      LocalNotificationService,
      RestTimeTrackingService,
      {
        provide: APP_INITIALIZER,
        useFactory: () => function () {},
        deps: [RestTimeTrackingService],
        multi: true
      }
    ],
    bootstrap: AppModuleConfig.bootstrap,
})
export class MobileAppModule { }
