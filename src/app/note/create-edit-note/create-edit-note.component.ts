import {Component, OnInit, Input, OnDestroy, Host, } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../../shared/state/project/project.model';
import { NoteService } from '../shared/notes.service';

import { Store } from '@ngrx/store';
import { AppState } from '../../shared/state/appState';
import { AppStateSelectors } from '../../shared/state/app-state.selectors';
import { Subscription } from 'rxjs/Subscription';
import { User }         from '../../shared/state/user/user.model';
import { Note } from 'app/shared/state/note/note.model';
import { ErrorService }                 from '../../core/error/error.service';
import { ModalService }                               from '../../core/modal/modal.service';
import { NotesActions }              from '../../shared/state/note/notes.actions';
import tinymce from 'pendulums-editor/tinymce';
import 'pendulums-editor/themes/modern/theme';
// Any plugins you want to use has to be imported
import 'pendulums-editor/plugins/hr/plugin.min';
import 'pendulums-editor/plugins/link/plugin.min';
import 'pendulums-editor/plugins/listwithcheckbox/plugin.min';
import 'pendulums-editor/plugins/image/plugin.min';
import 'pendulums-editor/plugins/codesample/plugin.min';
import showdown from 'showdown';
import TurndownService from 'turndown';

@Component({
  selector: 'create-edit-note',
  templateUrl: './create-edit-note.component.html',
  styleUrls: ['./create-edit-note.component.sass'],
})

export class CreateEditNoteComponent implements OnInit, OnDestroy {
  @Input() color;
  currentUser: Observable<User>;
  projects: Observable<Project[]>;
  projectsCopy: Project[];
  private subscription: Subscription;
  showPaletteBoolean = false;
  note: Note = new Note();
  formSubmitted;
  showIsArchive: boolean;

  constructor(@Host() parent: ModalService,
    private modalService: ModalService,
    private store: Store<AppState>,
    private notesActions: NotesActions,
    private noteService: NoteService,
    private errorService: ErrorService,
    appStateSelectors: AppStateSelectors) {
    this.projects = store.select(appStateSelectors.getProjectsArray)
  }
  ngOnInit(): void {
    this.subscription = this.projects.subscribe((projects) => {this.projectsCopy = projects})
    tinymce.init({
      selector: '#tiny',
      branding: false,
      menubar: false,
      resize: false,
      statusbar: false,
      fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
      toolbar: 'bold italic underline | numlist bullist checkbox | undo redo image link hr | codesample blockquote | styleselect',
      plugins: ['hr', 'link', 'listwithcheckbox', 'image', 'codesample'],
      style_formats: [
        {title: 'Header 1', format: 'h1'},
          {title: 'Header 2', format: 'h2'},
          {title: 'Header 3', format: 'h3'},
          {title: 'Header 4', format: 'h4'},
          {title: 'Header 5', format: 'h5'},
          {title: 'Header 6', format: 'h6'}
      ]
    });
    if (this.note.content) {
      tinymce.activeEditor.setContent(this.note.content);
    }
    tinymce.activeEditor.getBody().style.backgroundColor = this.color ? this.color : '#e5e5e5'
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    tinymce.remove();
  }

  createEditNote() {
    console.log('ss', this.note);

    if (this.note.id) {
      this.note.content = tinymce.activeEditor.getContent();
      this.noteService.update({note: this.note}).then((note) => {
        this.showError('The note was edited successfully');
        this.note = new Note();
        this.formSubmitted = false;
        this.modalService.close();
      })
        .catch(error => {
          this.showError('Server communication error');
        });
    } else {
      this.note.content = tinymce.activeEditor.getContent();
      this.noteService.create({note: this.note}).then((note) => {
        this.store.dispatch(this.notesActions.addNote(note));
        this.showError('The note was created successfully');
        this.note = new Note();
        this.formSubmitted = false;
        this.modalService.close();
      })
        .catch(error => {
          this.showError('Server communication error');
        });
    }
  }

  togglePalette() {
    this.showPaletteBoolean = !this.showPaletteBoolean;
  }
  selectColor(colorIndex) {
    this.note.colorPalette = colorIndex;
    this.togglePalette();
    let bgColor,
        fontColor
    switch (colorIndex) {
      case 0: {
        bgColor = '#e5e5e5';
        fontColor = '#4a4a4a';
      }
      break
      case 1: {
        bgColor = '#ff9166';
        fontColor = '#4a4a4a';
      }
        break;
      case 2: {
        bgColor = '#0a9bb3';
        fontColor = '#fff';
      }
        break;
      case 3: {
        bgColor = '#333333';
        fontColor = '#fff';
      }
        break;
      case 4: {
        bgColor = '#ffd470';
        fontColor = '#4a4a4a';
      }
        break;
      case 5: {
        bgColor = '#ff99cc';
        fontColor = '#4a4a4a';
      }
        break;
      case 6: {
        bgColor = '#d54552';
        fontColor = '#fff';
      }
        break;
      case 7: {
        bgColor = '#3ccc7c';
        fontColor = '#4a4a4a';
      }
        break;
      default : break;
    }
    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': bgColor}
    });
    tinymce.activeEditor.getBody().style.backgroundColor = bgColor
    tinymce.activeEditor.getBody().style.color = fontColor
  }
  deleteNote() {
    this.modalService.close();
    this.noteService.delete(this.note.id).then(() => {
      this.showError('Note was deleted successfully');
    })
      .catch(error => {
        this.showError('Server communication error');
      });
  }
  archiveNote() {
    this.showIsArchive = !this.showIsArchive
    this.note.isArchive = this.showIsArchive
  }
  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
