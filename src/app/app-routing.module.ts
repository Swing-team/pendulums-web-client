import { NgModule }                     from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { SignInComponent }              from './authentication/sign-in/sign-in.component';
import { SignUpComponent }              from './authentication/sign-up/sign-up.component';
import { ForgotPasswordComponent }      from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent }       from './authentication/reset-password/reset-password.component';
import { DashboardComponent }           from './dashboard/dashboard.component';
import { ActivitiesComponent }          from './dashboard/activities/list-activities/activities.component';
import { ProfileSettingComponent }      from './profile-setting/profile-setting.component';
import { AuthGuardService }             from './core/services/router-guards/auth-guard.service';
import { AnonymousGuardService }        from './core/services/router-guards/anonymous-guard.service';
import {NotFoundComponent} from "./not-found/not-found.component";

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/signIn',
    pathMatch: 'full'
  },
  {
    path: 'signIn',
    canActivate: [AnonymousGuardService],
    component: SignInComponent
  },
  {
    path: 'signUp',
    canActivate: [AnonymousGuardService],
    component: SignUpComponent
  },
  {
    path: 'forgotPassword',
    canActivate: [AnonymousGuardService],
    component: ForgotPasswordComponent
  },
  {
    path: 'resetPassword/:token',
    canActivate: [AnonymousGuardService],
    component: ResetPasswordComponent
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuardService],
    component: DashboardComponent
  },
  {
    path: 'activities/:projectId',
    canActivate: [AuthGuardService],
    component: ActivitiesComponent
  },
  {
    path: 'profile',
    canActivate: [AuthGuardService],
    component: ProfileSettingComponent
  },
  {
    path: 'notFound',
    component: NotFoundComponent
  }
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
export class AppRoutingModule {
  constructor(private router: Router) {
    this.router.errorHandler = (error: any) => {
      this.router.navigate(['notFound']);
    }
  }
}
