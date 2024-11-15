import { IConfigurableFormComponent, IShaFormInstance } from '@/interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { CodeLanguages } from './types';
import { IMetadata, IObjectMetadata } from '@/interfaces/metadata';
import { CodeTemplateSettings } from '@/components/codeEditor/models';
import { IMetadataBuilder } from '@/publicJsApis/metadataBuilder';
import { IObjectMetadataBuilder as IInternalObjectMetadataBuilder } from '@/utils/metadata/metadataBuilder';

export interface IExecutableCodeEditor {
  fileName?: string;
  wrapInTemplate?: boolean;
  templateSettings?: CodeTemplateSettings;

  /**
   * @deprecated to be removed
   */
  exposedVariables?: ICodeExposedVariable[];
}

export interface ICodeEditorProps extends Omit<IConfigurableFormComponent, 'type' | 'id'>, IExecutableCodeEditor {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  mode?: 'inline' | 'dialog';
  language?: CodeLanguages;
  availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>);
  resultType?: IMetadata | (() => Promise<IMetadata>);
}

export type GetAvailableConstantsArgs = {
  data: Record<string, any>; 
  metadataBuilder: IMetadataBuilder<IInternalObjectMetadataBuilder>;
  form: IShaFormInstance;
};
export type GetAvailableConstantsFunc = (args: GetAvailableConstantsArgs) => Promise<IObjectMetadata>;
export type GetResultTypeArgs = {
  data: Record<string, any>; 
  metadataBuilder: IMetadataBuilder<IInternalObjectMetadataBuilder>;
  form: IShaFormInstance;
};
export type GetResultTypeFunc = (args: GetResultTypeArgs) => Promise<IMetadata>;

export interface ICodeEditorComponentProps extends IConfigurableFormComponent, IExecutableCodeEditor {
  mode?: 'dialog' | 'inline';

  language?: CodeLanguages;
  availableConstantsExpression?: string | GetAvailableConstantsFunc;
  availableConstants?: IObjectMetadata;
  
  resultTypeExpression?: string | GetResultTypeFunc;
}