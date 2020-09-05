import { Component, OnInit, Input } from '@angular/core';
import { Note } from 'app/shared/state/note/note.model';
import { ModalService } from 'app/core/modal/modal.service';
import { CreateEditNoteComponent } from 'app/note/create-edit-note/create-edit-note.component';

@Component({
  selector: 'recent-notes',
  templateUrl: './recent-notes.component.html',
  styleUrls: ['./recent-notes.component.sass'],
})

export class RecentNotesComponent implements OnInit {
  @Input() notes: Note[];
  @Input() netConnected: boolean;
  @Input() projectsId;
  
  constructor(
    private modalService: ModalService,
  ) { }

  ngOnInit() { }

  showCreateEditNoteModal() {
    this.modalService.show({
      component: CreateEditNoteComponent,
      inputs: {
        note: new Note(),
        netConnected: this.netConnected,
      }
    });
  }
}