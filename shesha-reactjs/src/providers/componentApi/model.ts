import { IConfigurableFormComponent } from "../../providers/form/models";
import { IContainerWithNestedProperties, IHasMethods, IMetadata, TypeDefinition } from "@/interfaces/metadata";

export interface IApiMetadata extends IMetadata, IContainerWithNestedProperties, IHasMethods {
}

export type ComponentApiProperty<T extends object = object> = {
  [K in keyof T]: {
    name: K;
    getter?: (() => T[K]) | undefined;
    setter?: ((value: T[K]) => void) | undefined;
    skipIfExists?: boolean | undefined;
  };
}[keyof T];

export type CreateApiPropertyFunc = <T extends object = Record<string, unknown>>(data: T, property: ComponentApiProperty<T>) => void;

export interface IComponentApiDescription<T extends object = Record<string, unknown>> {
  id: string;
  componentName: string;
  level: number;
  isInput?: boolean;
  componentModel?: IConfigurableFormComponent | undefined;
  metadata?: IApiMetadata | undefined;
  typeDefinition?: TypeDefinition | undefined;
  skipUpdateTypeDefinitionIfExists?: boolean | undefined;
  api?: Partial<T> | undefined;
  propertiesLevel?: Record<string, number> | undefined;
  properties?: ComponentApiProperty<T>[];
}

export interface IComponentApi {
  readonly id: string;
  readonly components: Record<string, Record<string, unknown>>;
  updateApi: <T extends object = Record<string, unknown>>(api: IComponentApiDescription<T>) => void;
  removeApi: (id: string) => void;
  getApi: <PT extends Record<string, unknown>>(componentName: string) => IComponentApiDescription<PT> | undefined;
  getComponents: () => IComponentApiDescription[];
  createOrUpdateApiProperty: CreateApiPropertyFunc;
  refreshComponents: () => void;
  registerNestedApi: (api: IComponentApi) => void;
}

export type useComponentApiFunc = () => IComponentApi | undefined;

export interface IComponentApiInputRef<T> {
  value: T;
  onChange: (...args: unknown[]) => void;
}
