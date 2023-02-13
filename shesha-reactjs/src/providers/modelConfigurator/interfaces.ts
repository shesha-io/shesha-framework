import { ModelConfigurationDto } from "../../apis/modelConfigurations";

export interface IModelConfiguratorInstance {
    save: () => Promise<ModelConfigurationDto>;
    changeModelId: (id: string) => void;
    createNew: (model: ModelConfigurationDto) => void;
    delete: () => Promise<void>;
}