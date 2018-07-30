import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('Pendulum');
    // Whenever you add any entity, please update the
    // entityToKey object of DatabaseService
    this.version(2).stores({
      userData: 'userId',
      activeUser: '++id',
    }).upgrade(() => {
      this.table('userData').toCollection().modify(data => {
        data.projects.entities.map((project) => {
          project.colorPalette = 0
        })
      });
    });

    // Always keep the declarations previous versions
    // as long as there might be users having them running.
    this.version(1).stores({
      userData: 'userId',
      activeUser: '++id',
    });
  }
}

