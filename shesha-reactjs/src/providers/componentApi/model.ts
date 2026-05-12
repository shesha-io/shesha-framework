import { IConfigurableFormComponent } from "../../providers/form/models";
import { IContainerWithNestedProperties, IHasMethods, IMetadata, TypeDefinition } from "@/interfaces/metadata";

export interface IApiMetadata extends IMetadata, IContainerWithNestedProperties, IHasMethods {
}

export type ComponentApiProperty<T extends object = object> = {
  [K in keyof T]: {
    name: K;
    getter: () => T[K];
    setter?: ((value: T[K]) => void) | undefined;
    skipIfExists?: boolean;
  };
}[keyof T];

export type CreateApiPropertyFunc = <T extends object = Record<string, unknown>>(data: T, property: ComponentApiProperty<T>) => void;

export interface IComponentApiDescription<T extends object = Record<string, unknown>> {
  id: string;
  componentName: string;
  rawComponentModel?: IConfigurableFormComponent | undefined;
  componentModel?: IConfigurableFormComponent | undefined;
  metadata?: IApiMetadata | undefined;
  typeDefinition?: TypeDefinition | undefined;
  api?: Partial<T> | undefined;
}

export interface IComponentApi {
  id: string;
  updateApi: <T extends object = Record<string, unknown>>(api: IComponentApiDescription<T>, properties?: ComponentApiProperty<T>[]) => void;
  removeApi: (id: string) => void;
  getApi: <PT extends Record<string, unknown>>(componentName: string) => IComponentApiDescription<PT> | undefined;
  getComponents: () => IComponentApiDescription[];
  createApiProperty: CreateApiPropertyFunc;
}

export type useComponentApiFunc = () => IComponentApi | undefined;

export interface IComponentApiInputRef<T> {
  value: T;
  onChange: (...args: unknown[]) => void;
}
