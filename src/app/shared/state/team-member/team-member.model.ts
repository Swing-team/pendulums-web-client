import {transient} from '../../decorators/transient.decorator';

export class TeamMember {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  // FIXME: arminghm 24 Jul 2017 transient decorator is not working
  @transient()
  role: string;
}
