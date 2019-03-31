import {TeamMember} from '../team-member/team-member.model';

export class Note {
  id: string;
  title = '';
  content = '';
  owner: TeamMember;
  project: string;
  // [white == 0, salmon == 1, blue == 2, black == 3, yellow == 4, pink == 5, red == 6, green == 7]
  colorPalette = 0;
  isArchive: boolean
  updatedAt: string

  constructor() {}
}
