import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { NoteService }                        from './shared/notes.service';
import { NoteComponent }                      from './note.component';
import { BrowserModule }                      from '@angular/platform-browser';
import { BrowserAnimationsModule }            from '@angular/platform-browser/animations';
import { CreateEditNoteComponent }             from './create-edit-note/create-edit-note.component';
import { EditorModule } from 'pendulums-editor/tinymce-angular-component';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    EditorModule
  ],
  declarations: [
    NoteComponent,
    CreateEditNoteComponent,
  ],
  providers: [
    NoteService
  ],
  entryComponents: [
    CreateEditNoteComponent,
  ]
})

export class NoteModule { }
