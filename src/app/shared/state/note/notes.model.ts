import {Note} from './note.model';

export interface Notes {
  entities: {[id: string]: Note};
  sortBy: '+date' | '-date' | '+title' | '-title' | '+updateDate' | '-updateDate';
}
