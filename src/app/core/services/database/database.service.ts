import { Injectable }   from '@angular/core';
import { DexieService } from './dexie.service';


@Injectable()
export class DatabaseService {

  private entityToKey = {
    userData: 'userId'
  };
  constructor(private dexieService: DexieService) {}

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
}
