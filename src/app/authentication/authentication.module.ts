import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import {SignInComponent} from './sign-in/sign-in.component';
import {SignUpComponent} from './sign-up/sign-up.component';
import {AppRoutingModule} from '../app-routing.module';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {RecaptchaModule} from 'ng-recaptcha';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    RecaptchaModule.forRoot()
  ],
  declarations: [
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  providers: [],
})

export class AuthenticationModule { }
