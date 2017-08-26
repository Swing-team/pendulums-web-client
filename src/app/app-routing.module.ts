import { NgModule }                     from '@angular/core';
import { RouterModule, Routes }         from '@angular/router';
import { SignInComponent }              from './authentication/sign-in/sign-in.component';
import { SignUpComponent }              from './authentication/sign-up/sign-up.component';
import { ForgotPasswordComponent }      from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent }       from './authentication/reset-password/reset-password.component';
import { DashboardComponent }           from './dashboard/dashboard.component';
import {ActivitiesComponent}            from './dashboard/activities/list-activities/activities.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/signIn',
    pathMatch: 'full'
  },
  {
    path: 'signIn',
    component: SignInComponent
  },
  {
    path: 'signUp',
    component: SignUpComponent
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent
  },
  {
    path: 'resetPassword/:token',
    component: ResetPasswordComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'activities/:projectId',
    component: ActivitiesComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
