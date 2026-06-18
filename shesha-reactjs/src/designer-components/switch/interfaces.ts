import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleType {
  value?: boolean;
  defaultChecked?: boolean;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps>;
