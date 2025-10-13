import { FormInstance } from 'antd';
import { ModelConfigurationDto } from '@/apis/modelConfigurations';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { createNamedContext } from '@/utils/react';

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: IModelItem;
}

export interface IModelConfiguratorStateContext {
  id?: string;
  modelConfiguration?: ModelConfigurationDto;
  form?: FormInstance;
  isCreateNew?: boolean;
}

export interface IModelConfiguratorActionsContext {
  changeModelId: (id: string) => void;
  createNew: (model: ModelConfigurationDto) => void;
  load: () => void;
  save: (value: ModelConfigurationDto) => Promise<ModelConfigurationDto>;
  saveForm: () => Promise<ModelConfigurationDto>;
  cancel: () => void;
  delete: () => Promise<void>;
  submit: () => void;
  getModelSettings: () => ModelConfigurationDto;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE: IModelConfiguratorStateContext = {};

export const ModelConfiguratorStateContext = createNamedContext<IModelConfiguratorStateContext>(
  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
  "ModelConfiguratorStateContext",
);

export const ModelConfiguratorActionsContext = createNamedContext<IModelConfiguratorActionsContext>(undefined, "ModelConfiguratorActionsContext");
