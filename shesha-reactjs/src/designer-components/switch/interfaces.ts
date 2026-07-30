import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IInputStyles {
  value?: boolean | undefined;
  defaultChecked?: boolean | undefined;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps>;
