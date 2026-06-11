import { IConfigurableFormComponent } from '@/providers/form/models';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';

interface ICardContent {
  id: string;
  components?: IConfigurableFormComponent[] | undefined;
}

export interface ICardComponentProps extends IConfigurableFormComponent {
  className?: string | undefined;
  content?: ICardContent | undefined;
  header?: ICardContent | undefined;
  hideHeading?: boolean | undefined;
  hideWhenEmpty?: boolean | undefined;
  border?: IBorderValue | undefined;
  shadow?: IShadowValue | undefined;
  background?: IBackgroundValue | undefined;
}
