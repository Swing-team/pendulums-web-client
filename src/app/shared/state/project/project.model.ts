import {TeamMember} from '../team-member/team-member.model';

export class Project {
  id: string = null;
  name: string = null;
  image: string = null;
  invitedUsers = [];
  activities = [];
  owner: TeamMember;
  teamMembers: Array<TeamMember>;
  admins: Array<TeamMember>;
  recentActivityName: string = null;

  constructor() {}
}
