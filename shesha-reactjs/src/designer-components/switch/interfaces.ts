import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleType {
  value?: boolean;
  defaultChecked?: boolean;
}

interface ISwitchComponentCalulatedValues {
  eventHandlers: IEventHandlers;
}

export type SwitchComponentDefinition = IToolboxComponent<ISwitchComponentProps, ISwitchComponentCalulatedValues>;
