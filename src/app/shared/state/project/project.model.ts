import {TeamMember} from '../team-member/team-member.model';
import { Activity } from '../current-activity/current-activity.model';

export class Project {
  id: string = null;
  name: string = null;
  image: string = null;
  invitedUsers = [];
  activities: Activity[] = [];
  owner: TeamMember;
  teamMembers: Array<TeamMember>;
  admins: Array<TeamMember>;
  recentActivityName: string = null;
  // [white == 0, salmon == 1, blue == 2, black == 3, yellow == 4, pink == 5, red == 6, green == 7]
  colorPalette = 0;

  constructor() {}
}
