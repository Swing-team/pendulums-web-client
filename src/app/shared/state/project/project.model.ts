export class Project {
  id: string = null;
  name: string = null;
  image: string = null;
  invitedUsers = [];
  activities = [];
  owner: object;
  teamMembers: Array<object>

  constructor() {}
}
