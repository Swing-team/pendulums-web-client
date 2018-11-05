import { Component, Input, OnInit }                   from '@angular/core';
import { Store }                                      from '@ngrx/store';
import { AppState }                                   from '../shared/state/appState';
import { Observable }                                 from 'rxjs/Observable';
import { User }                                       from '../shared/state/user/user.model';
import { AppStateSelectors }                          from '../shared/state/app-state.selectors';
import { CreateEditNoteComponent }                    from './create-edit-note/create-edit-note.component';
import { ModalService }                               from '../core/modal/modal.service';
import { NoteService }                                from './shared/notes.service';



@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.sass']
})
export class NoteComponent implements OnInit {
  @Input() user: Observable<User>;
  notes: Observable<any>;


  constructor (private modalService: ModalService,
    appStateSelectors: AppStateSelectors,
    private noteService: NoteService,
    private store: Store<AppState>) {
    this.notes = store.select(appStateSelectors.getProjectsArray);
  }

  ngOnInit(): void {
    this.noteService.getNotes()
    console.log('vthis.noteService.getNotes', this.notes);
  }

  openCreateNotetModal() {
    console.log('openCreateNotetModal');

    this.modalService.show({
      component: CreateEditNoteComponent,
      inputs: {
        currentUser: this.user
      }
    });
  }

}


