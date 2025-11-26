import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type ICheckboxComponentProps = IConfigurableFormComponent;

interface ICheckboxComponentCalulatedValues {
  eventHandlers?: IEventHandlers<any>;
}

export type CheckboxComponentDefinition = ComponentDefinition<"checkbox", ICheckboxComponentProps, ICheckboxComponentCalulatedValues>;
