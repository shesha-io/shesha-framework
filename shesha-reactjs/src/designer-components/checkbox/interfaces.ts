import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type ICheckboxComponentProps = IConfigurableFormComponent;

export type CheckboxComponentDefinition = ComponentDefinition<"checkbox", ICheckboxComponentProps>;
