import { IComponentEventHandlers, IConfigurableFormComponent, IInputStyles, IStyleValue } from '@/providers/form/models';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';

interface ICardContent {
  id: string;
  components?: IConfigurableFormComponent[] | undefined;
}

/** Per-device styles of a card: its own and its header's. */
export interface ICardDeviceStyles extends IInputStyles {
  headerStyles?: IStyleValue | undefined;
}

export interface ICardComponentProps extends IConfigurableFormComponent<ICardDeviceStyles> {
  className?: string | undefined;
  content?: ICardContent | undefined;
  header?: ICardContent | undefined;
  hideHeading?: boolean | undefined;
  hideWhenEmpty?: boolean | undefined;
  border?: IBorderValue | undefined;
  shadow?: IShadowValue | undefined;
  background?: IBackgroundValue | undefined;
  /**
   * Style of the card's header: the component's Header Style over the Layout Components theme's Header
   * Defaults (see `getHeaderGroupStyle`) over the component defaults.
   */
  headerStyles?: IStyleValue | undefined;
  /** Event handlers of the header (click, hover, ...), as a panel's. */
  headerEvents?: IComponentEventHandlers | undefined;
}
