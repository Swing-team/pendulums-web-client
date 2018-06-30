import { User }   from '../../shared/state/user/user.model';

export const userRoleInProject = (project, userId) => {
  let role = 'team member';
  if (project.owner.id === userId) {
    role = 'owner';
  } else {
    project.admins.map(user => {
      if (user.id === userId) {
        role = 'admin';
      }
    });
  }
  return role;
};

export const userInProject = (project, userId) => {
  let user: User;
  project.teamMembers.map(projectUser => {
    if (projectUser.id === userId) {
      user = projectUser;
    }
  });

  return user;
};
