import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleType {
  value?: boolean;
  defaultChecked?: boolean;
}

interface ISwitchComponentCalulatedValues {
  eventHandlers: IEventHandlers;
}

export type SwitchComponentDefinition = ComponentDefinition<"switch", ISwitchComponentProps, ISwitchComponentCalulatedValues>;
