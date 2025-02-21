import { IConfigurableFormComponent } from '@/providers/form/models';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';

interface ICardContent {
  id: string;
  components?: IConfigurableFormComponent[];
}

export interface ICardComponentProps extends IConfigurableFormComponent {
  className?: string;
  content?: ICardContent;
  header?: ICardContent;
  hideHeading?: boolean;
  hideWhenEmpty?: boolean;
  border?: IBorderValue;
  shadow?: IShadowValue;
  background?: IBackgroundValue;
}
