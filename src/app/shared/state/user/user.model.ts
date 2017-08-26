import {Project} from '../project/project.model';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  pendingInvitations: Array<Project>;
}
