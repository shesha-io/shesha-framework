import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export interface ICheckboxComponentProps extends IConfigurableFormComponent, IInputStyles {}

export type CheckboxComponentDefinition = ComponentDefinition<"checkbox", ICheckboxComponentProps>;
