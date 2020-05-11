import * as io                          from 'socket.io-client';
import { Injectable }                   from '@angular/core';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../../shared/state/appState';
import { StatusActions }                from '../../shared/state/status/status.actions';
import { environment }                  from '../../../environments/environment';
import { Subject }                      from 'rxjs';

@Injectable()
export class SocketService {
  private socket = null;
  private messages = new Subject<{type: 'projectRemoved' | 'syncNeeded', data: any}>();
  private socketConnected = new Subject();
  public messages$ = this.messages.asObservable();
  public socketConnected$ = this.socketConnected.asObservable();

  constructor(private store: Store<AppState>, private statusActions: StatusActions) { }

  init(): any {
    this.connectSocket();
  }

  connectSocket() {
    this.socket = io(environment.socketEndpoint, {path: environment.socketPath, transports: ['websocket'], upgrade: true});
    this.socket.on('connect', () => {
      console.log('websocket connected!');
      this.socketConnected.next();
      this.store.dispatch(this.statusActions.updateNetStatus(true));
      this.socket.emit('get', {
        method: 'get',
        url: '/socket/subscribe-to-events',
      }, () => {
        // listen to events
      });
    });

    this.socket.on('message', (data) => {
        this.messages.next(data);
    });

    this.socket.on('disconnect', (error) => {
      console.log('websocket disconnected!');
      this.store.dispatch(this.statusActions.updateNetStatus(false));
    });
  }

  getSocketId(): string {
    return this.socket.id;
  }

  closeConnection(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.store.dispatch(this.statusActions.clearStatus());
    }
  }
}
