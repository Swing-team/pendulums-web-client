import {Component, OnInit, Input, OnDestroy} from '@angular/core';
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
import tinymce from 'pendulums-editor/tinymce';
import 'pendulums-editor/themes/modern/theme';
// Any plugins you want to use has to be imported
import 'pendulums-editor/plugins/hr/plugin.min';
import 'pendulums-editor/plugins/link/plugin.min';
import 'pendulums-editor/plugins/listwithcheckbox/plugin.min';
import 'pendulums-editor/plugins/image/plugin.min';
import 'pendulums-editor/plugins/codesample/plugin.min';

@Component({
  selector: 'create-edit-note',
  templateUrl: './create-edit-note.component.html',
  styleUrls: ['./create-edit-note.component.sass'],
})

export class CreateEditNoteComponent implements OnInit, OnDestroy {
  currentUser: Observable<User>;
  projects: Observable<Project[]>;
  projectsCopy: Project[];
  private subscription: Subscription;
  showPaletteBoolean = false;
  note: Note = new Note();
  formSubmitted;
  showIsArchive: boolean;

  constructor(private modalService: ModalService,
    private store: Store<AppState>,
    private noteService: NoteService,
    private errorService: ErrorService,
    appStateSelectors: AppStateSelectors) {
    this.projects = store.select(appStateSelectors.getProjectsArray)
  }
  ngOnInit(): void {
    this.subscription = this.projects.subscribe((projects) => {this.projectsCopy = projects})
    console.log('vthis.noteService.getNotes', this.noteService.getNotes());

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
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    tinymce.remove();
  }

  createEditNote() {
    this.noteService.create({
      note: {
        title: this.note.title,
        content: tinymce.activeEditor.getContent(),
        isArchive: this.showIsArchive
      },
      projectId: this.note.project,
      colorPalette: this.note.colorPalette
    }).then((note) => {
      console.log('note', note);

    })
      .catch(error => {
        this.showError('Server communication error');
      });
  }

  projectsTrackBy(index, project) {
    return project.id;
  }
  togglePalette() {
    this.showPaletteBoolean = !this.showPaletteBoolean;
  }
  selectColor(colorIndex) {
    this.note.colorPalette = colorIndex;
    this.togglePalette();
  }
  deleteNote() {
    console.log('delete');

    // this.modalService.close({
    //   component: CreateEditNoteComponent,
    // });
    this.noteService.delete(this.note.id).then(() => {

      this.showError('Note was deleted successfully');
    })
      .catch(error => {
        this.showError('Server communication error');
      });

  }
  archiveNote() {
    console.log('archive');
    console.log('this.showIsArchive', this.showIsArchive);
    this.showIsArchive = !this.showIsArchive

  }
  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
