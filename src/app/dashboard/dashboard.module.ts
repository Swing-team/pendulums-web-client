import { NgModule }               from '@angular/core';
import { AppRoutingModule }       from '../app-routing.module';
import { SharedModule }           from '../shared/shared.module';

import { CreateProjectComponent } from './projects/create-project/create-project.component';
import { DashboardComponent }     from './dashboard.component';

import { ProjectService }         from './shared/projects.service';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
  ],
  declarations: [
    CreateProjectComponent,
    DashboardComponent
  ],
  providers: [
    ProjectService
  ],
})

export class DashboardModule { }
