import { ModelConfigurationDto } from '@/apis/modelConfigurations';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { createNamedContext } from '@/utils/react';
import { FormInstance } from 'antd';

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: IModelItem;
}

export interface IPropertyErrors {
  propertyName: string;
  errors: string[];
}

export type ModelConfigurationError = IPropertyErrors | string;

export interface IModelConfiguratorStateContext {
  id?: string | undefined;
  initialConfiguration?: ModelConfigurationDto | undefined;
  modelConfiguration?: ModelConfigurationDto | undefined;
  isModified: boolean;
  isLoading: boolean;
  isSaving: boolean;
  errors?: ModelConfigurationError[] | undefined;
  showErrors?: boolean;
}

export interface IModelConfiguratorActionsContext {
  load: () => void;
  save: (value: ModelConfigurationDto) => Promise<ModelConfigurationDto>;
  getForm: () => FormInstance<ModelConfigurationDto>;
  saveForm: () => Promise<ModelConfigurationDto>;
  submit: () => void;
  getModelSettings: () => ModelConfigurationDto;
  setModified: (isModified: boolean) => void;
  validateModel: (model: ModelConfigurationDto) => IPropertyErrors[];
}

export const MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE: IModelConfiguratorStateContext = {
  isModified: false,
  isLoading: false,
  isSaving: false,
};

export const ModelConfiguratorStateContext = createNamedContext<IModelConfiguratorStateContext | undefined>(
  undefined,
  "ModelConfiguratorStateContext",
);

export const ModelConfiguratorActionsContext = createNamedContext<IModelConfiguratorActionsContext | undefined>(undefined, "ModelConfiguratorActionsContext");
