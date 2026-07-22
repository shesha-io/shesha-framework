import { IConfigurableFormComponent } from '@/providers/form/models';
import { ILabelValueEditorPropsBase } from '@/components/labelValueEditor/interfaces';
import { ComponentDefinition } from '@/interfaces';

export interface ILabelValueEditorComponentProps extends IConfigurableFormComponent, ILabelValueEditorPropsBase {
  mode?: 'dialog' | 'inline';
}

export type LabelValueEditorComponentDefinition = ComponentDefinition<"labelValueEditor", ILabelValueEditorComponentProps>;
