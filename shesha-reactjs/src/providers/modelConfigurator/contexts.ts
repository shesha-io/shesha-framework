import { FormInstance } from 'antd';
import { createContext } from 'react';
import { ModelConfigurationDto } from '../../apis/modelConfigurations';
import { IModelItem } from '../../interfaces/modelConfigurator';

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: IModelItem;
}

export interface IModelConfiguratorStateContext {
  id?: string;
  modelConfiguration?: ModelConfigurationDto;
  form?: FormInstance;
}

export interface IModelConfiguratorActionsContext {
  changeModelId: (id: string) => void;
  load: () => void;
  save: (value: ModelConfigurationDto) => Promise<ModelConfigurationDto>;
  submit: () => void;
  getModelSettings: () => ModelConfigurationDto;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE: IModelConfiguratorStateContext = {

};

export const ModelConfiguratorStateContext = createContext<IModelConfiguratorStateContext>(
  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE
);

export const ModelConfiguratorActionsContext = createContext<IModelConfiguratorActionsContext>(undefined);
