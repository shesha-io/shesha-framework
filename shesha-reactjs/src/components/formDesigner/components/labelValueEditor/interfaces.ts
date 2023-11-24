import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';

export interface IItemProps {
  id: string;
  key: string;
  value: string;
}

export interface ILabelValueEditorPropsBase {
  labelTitle: string;
  labelName: string;
  valueTitle: string;
  valueName: string;
}

export interface ILabelValueEditorComponentProps extends IConfigurableFormComponent, ILabelValueEditorPropsBase {
  mode?: 'dialog' | 'inline';
  exposedVariables?: ICodeExposedVariable[];
}