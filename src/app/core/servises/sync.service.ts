import 'rxjs/add/operator/toPromise';
import {Inject, Injectable, OnInit} from '@angular/core';
import { Http }                         from '@angular/http';
import { APP_CONFIG }                   from '../../app.config';
import { io }  from 'socket.io-client';
import {Store} from '@ngrx/store';
import {AppState} from '../../shared/state/appState';

@Injectable()
export class SyncService implements OnInit {
  private socket = null;
  constructor(private http: Http,
              @Inject(APP_CONFIG) private config,
              private store: Store<AppState>,) {
  }

  syncData(data): Promise<any> {
    return this.http
      .put(this.config.apiEndpoint + '/sync/activities', JSON.stringify(data), this.config.httpOptions)
      .toPromise()
      .then(() => console.log('Offline activities has been sync with server successfully :)'))
      .catch(this.handleError);
  }

  ngOnInit(): void {
    this.socket = io.connect(this.config.socketEndpoint,
      {transports: ['websocket'], upgrade: false});

    this.socket.on('connected', function (data) {
      // make connection status true
    });

    this.socket.on('connect_error', function (error) {
      // make connection status false
    });
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
