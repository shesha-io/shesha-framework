import { ComponentDefinition, IConfigurableFormComponent, IShaFormInstance, UnwrapCodeEvaluators } from '@/interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { CodeLanguages } from './types';
import { IMetadata, IObjectMetadata } from '@/interfaces/metadata';
import { CodeTemplateSettings } from '@/components/codeEditor/models';
import { Environment, IMetadataBuilder } from '@/publicJsApis/apis/metadataBuilder';
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

export interface ICodeEditorProps extends Omit<UnwrapCodeEvaluators<IConfigurableFormComponent>, 'type' | 'id'>, IExecutableCodeEditor {
  id?: string | undefined;
  placeholder?: string | undefined;
  value?: string | undefined;
  onChange?: ((value: string | null) => void) | undefined;
  mode?: 'inline' | 'dialog' | undefined;
  language?: CodeLanguages | undefined;
  className?: string | undefined;
  availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined;
  resultType?: IMetadata | (() => Promise<IMetadata>) | undefined;
  environment?: Environment | undefined;
}

export type GetAvailableConstantsArgs = {
  data: Record<string, unknown>;
  metadataBuilder: IMetadataBuilder<IInternalObjectMetadataBuilder>;
  form: IShaFormInstance;
};
export type GetAvailableConstantsFunc = (args: GetAvailableConstantsArgs) => Promise<IObjectMetadata>;
export type GetResultTypeArgs = {
  data: Record<string, unknown>;
  metadataBuilder: IMetadataBuilder<IInternalObjectMetadataBuilder>;
  form: IShaFormInstance;
};
export type GetResultTypeFunc = (args: GetResultTypeArgs) => Promise<IMetadata>;

export interface ICodeEditorComponentProps extends IConfigurableFormComponent, IExecutableCodeEditor {
  mode?: 'dialog' | 'inline' | undefined;

  environment?: Environment | undefined;
  language?: CodeLanguages | undefined;
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
  availableConstants?: IObjectMetadata | undefined;

  resultTypeExpression?: string | GetResultTypeFunc | undefined;
}

export type CodeEditorComponentDefinition = ComponentDefinition<"codeEditor", ICodeEditorComponentProps>;
