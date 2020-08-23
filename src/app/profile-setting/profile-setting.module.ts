import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ProfileSettingComponent } from './profile-setting.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    ProfileSettingComponent,
  ],
  providers: [],
})
export class ProfileSettingModule { }
