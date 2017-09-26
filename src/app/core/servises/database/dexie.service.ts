import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('Pendulum');
    // Whenever you add any entity, please update the
    // entityToKey object of DatabaseService
    this.version(1).stores({
      activities: 'userId',
      userData: 'userId',
      activeUser: '++id',
    });
  }
}
