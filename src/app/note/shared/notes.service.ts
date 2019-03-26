import { Injectable}            from '@angular/core';
import { HttpClient }           from '@angular/common/http';
import { Note }              from '../../shared/state/note/note.model';
import { SyncService }          from '../../core/services/sync.service';
import { environment }          from '../../../environments/environment';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class NoteService {
  private options;
  private turndownService: TurndownService = new TurndownService();
  constructor(private http: HttpClient,
              private syncService: SyncService) {
    this.options = {...environment.httpOptions, responseType: 'text'};
  }

  getNotes(): Promise<Note[]> {
    return this.http
      .get(environment.apiEndpoint + '/notes/getAll', environment.httpOptions)
      .toPromise()
      .then(response => response as Note[])
      .catch(this.handleError);
  }

  create(note): Promise<Note> {
    let content;
    if (note.note.content) {
      const taskListItems = turndownPluginGfm.taskListItems
      this.turndownService.use(taskListItems)
      content = this.turndownService.turndown(note.note.content);

    }
    return this.http
      .post(environment.apiEndpoint + '/notes', {note: {...note.note, content: content}}, {withCredentials: true})
      .toPromise()
      .then(response => response as Note)
      .catch(this.handleError);
  }
  update(note): Promise<Note> {
    const taskListItems = turndownPluginGfm.taskListItems
    this.turndownService.use(taskListItems)
    const content = this.turndownService.turndown(note.note.content);
    return this.http
      .put(environment.apiEndpoint + '/notes/' + note.note.id, {note: {...note.note, content: content}}, {withCredentials: true})
      .toPromise()
      .then(response => response[0] as Note)
      .catch(this.handleError);
  }

  delete(noteId): Promise<any> {
    return this.http
      .delete(environment.apiEndpoint + '/notes/' + noteId, this.options)
      .toPromise()
      .then(response => {
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
