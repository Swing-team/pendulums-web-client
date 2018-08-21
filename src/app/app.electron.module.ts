import { APP_INITIALIZER, NgModule }  from '@angular/core';
import { AppModuleConfig }            from './app.module.config';
import { ElectronService }            from './electron/electron.service';

@NgModule({
    declarations: AppModuleConfig.declarations,
    imports: AppModuleConfig.imports,
    providers: [
      ...AppModuleConfig.providers,
      ElectronService,
      {
        provide: APP_INITIALIZER,
        useFactory: () => function () {},
        deps: [ElectronService],
        multi: true
      }
    ],
    bootstrap: AppModuleConfig.bootstrap,
})
export class ElectronAppModule { }
