import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ILabelValueEditorPropsBase } from '@/components/labelValueEditor/interfaces';
import { ComponentDefinition } from '@/interfaces';

export interface ILabelValueEditorComponentProps extends IConfigurableFormComponent, ILabelValueEditorPropsBase {
  mode?: 'dialog' | 'inline';
  exposedVariables?: ICodeExposedVariable[];
}

export type LabelValueEditorComponentDefinition = ComponentDefinition<"labelValueEditor", ILabelValueEditorComponentProps>;
