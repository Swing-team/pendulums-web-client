import {Project} from './project.model';

export interface Projects {
  entities: {[id: string]: Project};
  selectedProject: string;
}
