import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AppRoutingModule} from '../app-routing.module';
import {CreateProjectComponent} from './projects/create-project/create-project.component';
import {DashboardComponent} from './dashboard.component';

// TODO: mahsa 03 Jul 2017: move to shared module
import { IdenticonHashDirective } from '../shared/identicon-hash.directive';
import {ProjectServices} from './shared/projects.services';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    CreateProjectComponent,
    DashboardComponent,
    IdenticonHashDirective
  ],
  providers: [
    ProjectServices
  ],
})

export class DashboardModule { }
