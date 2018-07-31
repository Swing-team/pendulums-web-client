import { NgModule } from '@angular/core';
import { AppModuleConfig } from './app.module.config';

@NgModule({
    declarations: AppModuleConfig.declarations,
    imports: AppModuleConfig.imports,
    providers: AppModuleConfig.providers,
    bootstrap: AppModuleConfig.bootstrap
})
export class ElectronAppModule { }
