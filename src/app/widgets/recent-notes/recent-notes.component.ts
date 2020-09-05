import { Component, OnInit, Input } from '@angular/core';
import { Note } from 'app/shared/state/note/note.model';

@Component({
  selector: 'recent-notes',
  templateUrl: './recent-notes.component.html',
  styleUrls: ['./recent-notes.component.sass'],
})

export class RecentNotesComponent implements OnInit {
  @Input() notes: Note[];
  
  constructor() { }

  ngOnInit() { }
}