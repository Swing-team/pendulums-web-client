import Dexie from 'dexie';
import { Settings } from '../../../shared/state/user/user.model';

export class DexieService extends Dexie {
  constructor() {
    super('Pendulum');
    // Whenever you add any entity, please update the
    // entityToKey object of DatabaseService
    this.version(5).stores({
      userData: 'userId',
      activeUser: '++id',
      appInfo: 'userId',
    }).upgrade((tb) => {
      return tb['userData'].toCollection().modify(data => {
        Object.keys(data.data.theme.entities).forEach(function(key) {
          data.data.theme.entities[key].isLightTheme = false;
        });
      });
    });

    this.version(4).stores({
      userData: 'userId',
      activeUser: '++id',
      appInfo: 'userId',
    }).upgrade((tb) => {
      return tb['userData'].toCollection().modify(data => {
        data.data.settings = {
          receiveForgottenActivityEmail: true,
          relaxationTime: {
            isEnabled: false,
            workingTime: 3000000,
            restTime: 900000
          }
        } as Settings
      });
    });

    this.version(3).stores({
      userData: 'userId',
      activeUser: '++id',
      appInfo: 'userId',
    }).upgrade((tb) => {
      return tb['userData'].toCollection().modify(data => {
        Object.keys(data.data.projects.entities).forEach(function(key) {
          data.data.projects.entities[key].colorPalette = 0;
        });
      });
    });

    // Whenever you add any entity, please update the
    // entityToKey object of DatabaseService
    this.version(2).stores({
      userData: 'userId',
      activeUser: '++id',
    }).upgrade((tb) => {
      console.log('tryuio', tb);
      return tb['userData'].toCollection().modify(data => {
        Object.keys(data.data.projects.entities).forEach(function(key) {
          data.data.projects.entities[key].colorPalette = 0;
        });
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

