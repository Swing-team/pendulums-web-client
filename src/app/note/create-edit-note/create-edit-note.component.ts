import {Component, OnInit, Input, OnDestroy, AfterViewInit, Host, ViewChild, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../../shared/state/project/project.model';
import { NoteService } from '../shared/notes.service';

import { Store } from '@ngrx/store';
import { AppState } from '../../shared/state/appState';
import { AppStateSelectors } from '../../shared/state/app-state.selectors';
import { Subscription } from 'rxjs/Subscription';
import { Note } from 'app/shared/state/note/note.model';
import { ErrorService }                 from '../../core/error/error.service';
import { ModalService }                               from '../../core/modal/modal.service';
import { NotesActions }              from '../../shared/state/note/notes.actions';
import tinymce from 'pendulums-editor/tinymce.min';
import 'pendulums-editor/themes/modern/theme.min';
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

export class CreateEditNoteComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('createEditNoteForm') createEditNoteForm;
  @ViewChild('noteCreatePalette') noteCreatePalette;
  @Input() deleteButtonDisabled: boolean;
  @Input() note: Note;
  projects: Observable<Project[]>;
  projectsCopy: Project[];
  private subscriptions: Subscription[] = [];
  content = '';
  showPaletteBoolean = false;
  showIsArchive: boolean;
  deleteConfirmation = false;

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
    const color = [
      '#e5e5e5', '#ff9166', '#0a9bb3', '#333333', '#ffd470', '#ff99cc', '#d54552', '#3ccc7c'
    ][this.note.colorPalette]

    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': color}
    });
    this.subscriptions.push(this.projects.subscribe((projects) => {this.projectsCopy = projects}))
    this.subscriptions.push(this.createEditNoteForm.valueChanges.debounceTime(1000).subscribe(data => {
      this.createEditNote()
    }))
  }

  ngAfterViewInit() {
    this.selectColor(this.note.colorPalette);
    tinymce.get('tiny').on('click', () =>  {
      this.showPaletteBoolean = false
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    tinymce.remove();
  }

  createEditNote() {
    if (this.note.id) {
      this.noteService.update({note: this.note}).then((note) => {
        this.store.dispatch(this.notesActions.updateNote(note));
      })
        .catch(error => {
          this.showError('Server communication error');
        });
    } else {
        this.noteService.create({note: this.note}).then((note) => {
          this.store.dispatch(this.notesActions.addNote(note));
          this.note = note as Note
      })
        .catch(error => {
          this.showError('Server communication error');
        });
    }
  }

  togglePalette() {
    this.showPaletteBoolean = !this.showPaletteBoolean;
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (this.showPaletteBoolean && !this.noteCreatePalette.nativeElement.contains(event.target)
      && event.target.id !== 'id2') {
      this.togglePalette();
    }
  }

  selectColor(colorIndex) {
    this.note.colorPalette = colorIndex;
    this.showPaletteBoolean = false;
    const [bgColor, fontColor] = [
      ['#e5e5e5', '#4a4a4a'],
      ['#ff9166', '#4a4a4a'],
      ['#0a9bb3', '#ffffff'],
      ['#333333', '#ffffff'],
      ['#ffd470', '#4a4a4a'],
      ['#ff99cc', '#4a4a4a'],
      ['#d54552', '#ffffff'],
      ['#3ccc7c', '#4a4a4a'],
    ][this.note.colorPalette];

    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': bgColor}
    });
    tinymce.get('tiny').getBody().style.backgroundColor = bgColor
    tinymce.get('tiny').getBody().style.color = fontColor
  }

  deleteNote() {
    this.deleteConfirmation = true;
  }

  confirmDelete() {
    this.modalService.close();
    this.noteService.delete(this.note.id).then(() => {
      this.showError('Note was deleted successfully');
      this.store.dispatch(this.notesActions.removeNote(this.note.id));
    })
      .catch(error => {
        this.showError('Server communication error');
      });
  }

  cancelDelete() {
    if (!this.deleteButtonDisabled) {
      this.deleteConfirmation = false;
    }
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
