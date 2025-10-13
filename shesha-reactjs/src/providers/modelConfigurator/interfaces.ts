import { ModelConfigurationDto } from '@/apis/modelConfigurations';

export interface IModelConfiguratorInstance {
  save: () => Promise<ModelConfigurationDto>;
  cancel: () => void;
  changeModelId: (id: string) => void;
  createNew: (model: ModelConfigurationDto) => void;
  delete: () => Promise<void>;
}
