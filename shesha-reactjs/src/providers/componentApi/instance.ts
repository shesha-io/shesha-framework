import { toCamelCase } from "@/utils/string";
import { IComponentApiActions, IComponentApiDescription, ComponentApiProperty } from "./model";

export class ComponentApiInstance implements IComponentApiActions {
  private parent?: IComponentApiActions | undefined;

  private componentApis: Map<string, IComponentApiDescription>;

  id: string;

  constructor(id: string, parent?: IComponentApiActions) {
    this.id = id;
    this.parent = parent;
    this.componentApis = new Map<string, IComponentApiDescription>();
  }

  // ToDo: AS - review component naming rules, there are can be duplicates and incorrect names
  updateApi<T extends object = Record<string, unknown>>(api: IComponentApiDescription<T>, properties?: ComponentApiProperty<T>[]): void {
    const componentName = toCamelCase(api.componentName, { keepLeadingSeparators: false });
    if (!componentName || !api.id) return;
    const localApi = (this.componentApis.get(api.id) ?? { id: api.id }) as IComponentApiDescription<T>;
    if (localApi.api === undefined) localApi.api = { } as T;
    localApi.componentName = componentName;
    if (api.typeDefinition)
      localApi.typeDefinition = api.typeDefinition;
    if (api.componentModel)
      localApi.componentModel = api.componentModel;
    if (api.rawComponentModel)
      localApi.rawComponentModel = api.rawComponentModel;
    if (api.metadata)
      localApi.metadata = api.metadata;
    for (const key in api.api) {
      if (Object.prototype.hasOwnProperty.call(api.api, key)) {
        // update api values and properties
        delete localApi.api[key];
        localApi.api[key] = api.api[key];
      }
    }
    properties?.forEach((property) => this.createApiProperty(localApi.api as T, { name: property.name, getter: property.getter, setter: property.setter }));
    this.componentApis.set(api.id, localApi);
  };

  removeApi(id: string): void {
    this.componentApis.delete(id);
  };

  getApi<PT extends Record<string, unknown>>(componentNameOrId: string): IComponentApiDescription<PT> | undefined {
    return (Array.from(this.componentApis.values()).find((x) => x.componentName === componentNameOrId) ?? this.componentApis.get(componentNameOrId)) as IComponentApiDescription<PT> | undefined;
  };

  getComponents(): IComponentApiDescription[] {
    const parentList = this.parent?.getComponents();
    const list = Array.from(this.componentApis.values());
    const localNames = new Set(list.map((x) => x.componentName));
    parentList?.forEach((x) => {
      // add only components with unique names (leave only closest components in hierarchy)
      if (!localNames.has(x.componentName))
        list.push(x);
    });
    return list;
  };

  createApiProperty<PT extends object = Record<string, unknown>>(data: PT, property: ComponentApiProperty<PT>): void {
    Object.defineProperty(data, property.name, {
      get() {
        return property.getter();
      },
      set(value: PT[keyof PT]) {
        if (property.setter)
          property.setter(value);
        else
          console.warn(`Property "${String(property.name)}" is read-only`);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
