import { Injectable }   from '@angular/core';
import { DexieService } from './dexie.service';
import { Store }        from '@ngrx/store';
import { AppState }     from '../../../shared/state/appState';
import { debounceTime }             from 'rxjs/operators';


@Injectable()
export class DatabaseService {
  private stateObserver: any;
  private entityToKey = {
    userData: 'userId'
  };
  constructor(private dexieService: DexieService,
              private store: Store<AppState>) {
    // todo: It can be better later
    this.stateObserver = store.pipe(debounceTime(100)).subscribe((state) => {
      let uId: string;
      uId = state.user.id;
      if (uId) {
        this.createOrUpdate('userData', {data: state, userId: uId })
          .then((data) => {
          console.log('state stored at dexie db.');
          });
        }
    });
  }

  createOrUpdate(tableName, data) {
    const table = this.dexieService.table(tableName);
    return table.put(data);
  }

  get(tableName, id) {
    const table = this.dexieService.table(tableName);
    return table.get(id);
  }

  getAll(tableName) {
    const table = this.dexieService.table(tableName);
    return table.toArray();
  }

  update(tableName, id, data) {
    const table = this.dexieService.table(tableName);
    return table.update(id, data);
  }

  remove(tableName, id) {
    const table = this.dexieService.table(tableName);
    return table.delete(id);
  }

  removeAll(tableName) {
    const table = this.dexieService.table(tableName);
    return table.clear();
  }

  unSubscribeState() {
    this.stateObserver.unsubscribe();
  }
}
