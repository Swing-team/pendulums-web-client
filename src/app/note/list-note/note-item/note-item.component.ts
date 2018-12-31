import { Component, OnInit, Input }                   from '@angular/core';
import { Store }                                      from '@ngrx/store';
import { Note }                                       from '../../../shared/state/note/note.model';
import { NoteService }                                from '../../shared/notes.service';
import { ErrorService }                               from '../../../core/error/error.service';
import { AppState }                                   from '../../../shared/state/appState';
import { NotesActions }                               from '../../../shared/state/note/notes.actions';
import { ModalService }                               from '../../../core/modal/modal.service';
import { CreateEditNoteComponent }                    from '../../create-edit-note/create-edit-note.component';
import { cloneDeep }                                  from 'lodash';



@Component({
  selector: 'note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.sass']
})
export class NoteItemComponent implements OnInit {
  @Input() note: Note;
  @Input() deleteButtonDisabled: boolean;
  deleteConfirmation = false;
  constructor(
    private modalService: ModalService,
    private noteService: NoteService,
    private errorService: ErrorService,
    private store: Store<AppState>,
    private notesActions: NotesActions
    ) {
  }

  ngOnInit(): void {
  }

  editModal() {
    const color = [
      '#e5e5e5', '#ff9166', '#0a9bb3', '#333333', '#ffd470', '#ff99cc', '#d54552', '#3ccc7c'
    ][this.note.colorPalette]

    this.modalService.show({
      component: CreateEditNoteComponent,
      inputs: {
        note: cloneDeep(this.note),
      }
    });
    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': color}
    });
  }

  deleteNote() {
    this.deleteConfirmation = true;
  }

  confirmDelete() {
    this.noteService.delete(this.note.id).then(() => {
      this.store.dispatch(this.notesActions.removeNote(this.note.id));
      this.showError('Note was deleted successfully');
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

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

}


