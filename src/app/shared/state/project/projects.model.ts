import {Project} from './project.model';

export interface Projects {
  entities: {[id: string]: Project};
  selectedProject: string;
  sortBy: '+date' | '-date' | '+name' | '-name' | '+activity' | '-activity';
}
