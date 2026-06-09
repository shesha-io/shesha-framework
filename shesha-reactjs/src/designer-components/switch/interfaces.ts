import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleValue {
  value?: boolean;
  defaultChecked?: boolean;
}

interface ISwitchComponentCalulatedValues {
  eventHandlers: IEventHandlers;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps, ISwitchComponentCalulatedValues>;
