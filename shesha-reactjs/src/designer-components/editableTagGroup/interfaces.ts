import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IEditableTagGroupComponentProps extends IConfigurableFormComponent {
  value?: string[];
  onChange?: (values?: string[]) => void;
}

export type EditableTagGroupComponentDefinition = IToolboxComponent<IEditableTagGroupComponentProps>;
