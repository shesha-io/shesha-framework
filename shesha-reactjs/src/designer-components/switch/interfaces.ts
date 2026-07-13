import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleValue {
  value?: boolean;
  defaultChecked?: boolean;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps>;
