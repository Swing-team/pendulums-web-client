import { NgModule }               from '@angular/core';
import { AppRoutingModule }       from '../app-routing.module';
import { SharedModule }           from '../shared/shared.module';

import { CreateProjectComponent } from './projects/create-project/create-project.component';
import {ListOfProjectComponent} from './projects/list-project/list-of-project.component';
import { DashboardComponent }     from './dashboard.component';

import { ProjectService }         from './shared/projects.service';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
  ],
  declarations: [
    CreateProjectComponent,
    ListOfProjectComponent,
    DashboardComponent
  ],
  providers: [
    ProjectService
  ],
})

export class DashboardModule { }
