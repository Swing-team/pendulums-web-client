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
  let role: User;
  project.teamMembers.map(user => {
    if (user.id === userId) {
      role = user;
    }
  });

  return role;
};
