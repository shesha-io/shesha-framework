import { IAceOptions } from 'react-ace';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { ICodeExposedVariable } from '../../../codeVariablesTable';
import { EditorModes } from './types';

export interface ICodeEditorProps extends IConfigurableFormComponent {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  mode?: 'inline' | 'dialog';
  setOptions?: IAceOptions;
  language?: EditorModes;
  exposedVariables?: ICodeExposedVariable[];
}

export interface ICodeEditorComponentProps extends IConfigurableFormComponent {
  mode?: 'dialog' | 'inline';
  exposedVariables?: ICodeExposedVariable[];
}