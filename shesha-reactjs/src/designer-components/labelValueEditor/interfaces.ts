import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ILabelValueEditorPropsBase } from '@/components/labelValueEditor/interfaces';

export interface ILabelValueEditorComponentProps extends IConfigurableFormComponent, ILabelValueEditorPropsBase {
  mode?: 'dialog' | 'inline';
  exposedVariables?: ICodeExposedVariable[];
}
