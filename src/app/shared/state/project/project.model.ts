export class Project {
  id: string = null;
  name: string = null;
  image: string = null;
  invitedUsers = [];
  owner: object;
  teamMembers: Array<object>

  constructor() {}
}
