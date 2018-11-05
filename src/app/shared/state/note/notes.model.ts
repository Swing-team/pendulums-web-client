import {Note} from './note.model';

export interface Notes {
  entities: {[id: string]: Note};
  selectedNote: string;
}
