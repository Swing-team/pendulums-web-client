import { Component, OnInit, Input }                   from '@angular/core';
import { Store }                                      from '@ngrx/store';
import { Note }                                       from '../../../shared/state/note/note.model';
import { NoteService }                                from '../../shared/notes.service';
import { ErrorService }                               from '../../../core/error/error.service';
import { AppState }                                   from '../../../shared/state/appState';
import { NotesActions }                               from '../../../shared/state/note/notes.actions';
import { ModalService }                               from '../../../core/modal/modal.service';
import { CreateEditNoteComponent }                    from '../../create-edit-note/create-edit-note.component';




@Component({
  selector: 'note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.sass']
})
export class NoteItemComponent implements OnInit {
  @Input() note: Note;
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
    let color;
    switch (this.note.colorPalette) {
      case 0: {
        color = '#e5e5e5';
      }
      break
      case 1: {
        color = '#ff9166';
      }
        break;
      case 2: {
        color = '#0a9bb3';
      }
        break;
      case 3: {
        color = '#333333';
      }
        break;
      case 4: {
        color = '#ffd470';
      }
        break;
      case 5: {
        color = '#ff99cc';
      }
        break;
      case 6: {
        color = '#d54552';
      }
        break;
      case 7: {
        color = '#3ccc7c';
      }
        break;
      default : break;
    }
    this.modalService.show({
      component: CreateEditNoteComponent,
      inputs: {
        note: this.note,
        color: color
      }
    });
    this.modalService.applyStyleDynamically({
      component: CreateEditNoteComponent,
      customBodyStyles: {'background': color}
    });
  }

  deleteNote() {
    this.noteService.delete(this.note.id).then(() => {
      this.store.dispatch(this.notesActions.removeNote(this.note.id));
      this.noteService.getNotes().then((notes) => {
        this.store.dispatch(this.notesActions.loadNotes(notes));
      })
      this.showError('Note was deleted successfully');
    })
      .catch(error => {
        this.showError('Server communication error');
      });
  }
  showError(error) {
    this.errorService.show({
      input: error
    });
  }

}


