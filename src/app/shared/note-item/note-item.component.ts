import { Component, OnInit, Input, ViewEncapsulation }                   from '@angular/core';
import { Store }                                      from '@ngrx/store';
import { Note }                                       from '../../shared/state/note/note.model';
import { ErrorService }                               from '../../core/error/error.service';
import { AppState }                                   from '../../shared/state/appState';
import { NotesActions }                               from '../../shared/state/note/notes.actions';
import { ModalService }                               from '../../core/modal/modal.service';
import { cloneDeep }                                  from 'lodash';
import { NoteService }                                from 'app/core/services/notes.service';
import { CreateEditNoteComponent }                    from 'app/note/create-edit-note/create-edit-note.component';



@Component({
  selector: 'note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.sass'],
  // prevent encapsulation to apply styles to dynamically
  // inserted htmls via innerHtml binding.
  encapsulation: ViewEncapsulation.None
})
export class NoteItemComponent implements OnInit {
  @Input() note: Note;
  @Input() projectsId;
  @Input() deleteButtonDisabled: boolean;
  @Input() netConnected: boolean;
  @Input() setFullHeight: boolean;
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
        netConnected: this.netConnected,
      }
    });
    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': color}
    });
  }

  deleteNote() {
    if (this.netConnected) {
      this.deleteConfirmation = true;
    } else {
      this.showError('This feature is not available in offline mode.');
    }
  }

  confirmDelete() {
    this.noteService.delete(this.note.id).then(() => {
      this.store.dispatch(this.notesActions.removeNote(this.note.id));
      this.showError('The note was deleted successfully');
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


