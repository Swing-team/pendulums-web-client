import { Project } from 'app/shared/state/project/project.model';
import { TeamMember } from 'app/shared/state/team-member/team-member.model';

export const userRoleInProject = (project: Project, userId: string) => {
  let role = 'team member';
  if (project.owner.id === userId) {
    role = 'owner';
  } else {
    project.admins.forEach(user => {
      if (user.id === userId) {
        role = 'admin';
      }
    });
  }
  return role;
};

export const userInProject = (project: Project, userId: string) => {
  let user: TeamMember;
  project.teamMembers.map(projectUser => {
    if (projectUser.id === userId) {
      user = projectUser;
    }
  });

  return user;
};
