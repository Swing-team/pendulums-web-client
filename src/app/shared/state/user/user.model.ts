import {Project} from '../project/project.model';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  pendingInvitations: Array<Project>;
  settings: Settings;
}

export interface Settings {
  receiveForgottenActivityEmail: boolean;
  relaxationTime: RelaxationTime
}

export interface RelaxationTime {
  isEnabled: boolean,
  workTime: number,
  restTime: number
}
