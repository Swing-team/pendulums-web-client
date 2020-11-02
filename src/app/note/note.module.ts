import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { NoteComponent }                      from './note.component';
import { BrowserAnimationsModule }            from '@angular/platform-browser/animations';
import { CreateEditNoteComponent }             from './create-edit-note/create-edit-note.component';
import { EditorModule } from 'pendulums-editor/tinymce-angular-component';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    BrowserAnimationsModule,
    SharedModule,
    EditorModule
  ],
  declarations: [
    NoteComponent,
    CreateEditNoteComponent,
  ],
  providers: [ ],
  entryComponents: [
    CreateEditNoteComponent,
  ]
})

export class NoteModule { }
