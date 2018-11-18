import { Component, OnInit, Input }                   from '@angular/core';
import { Store }                                      from '@ngrx/store';
import { Note }                                       from '../../../shared/state/note/note.model';
import { NoteService }                                from '../../shared/notes.service';
import { ErrorService }                               from '../../../core/error/error.service';
import { AppState }                                   from '../../../shared/state/appState';
import { NotesActions }                               from '../../../shared/state/note/notes.actions';




@Component({
  selector: 'note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.sass']
})
export class NoteItemComponent implements OnInit {
  @Input() note: Note;
  constructor(
    private noteService: NoteService,
    private errorService: ErrorService,
    private store: Store<AppState>,
    private notesActions: NotesActions
    ) {
  }

  ngOnInit(): void {
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


