import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles, IStyleValue } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IInputStyles {
  value?: boolean | undefined;
  /**
   * Styles for the switch handle (the moving knob). The root style set styles the track,
   * so the two are configured independently.
   */
  handleStyles?: IStyleValue | undefined;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps>;
