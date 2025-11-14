import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type ICheckboxComponentProps = IConfigurableFormComponent;

interface ICheckboxComponentCalulatedValues {
  eventHandlers?: IEventHandlers<any>;
}

export type CheckboxComponentDefinition = IToolboxComponent<ICheckboxComponentProps, ICheckboxComponentCalulatedValues>;
