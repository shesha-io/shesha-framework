import { IPropertyMetadata } from "@/interfaces/metadata";
import { IConfigurableFormComponent } from "../form/models";
import { ISettingsFormFactory } from "@/interfaces";

/** Named Data Source */
export interface IDataSource {
  id: string;
  name: string;
  containerType: string;
  items: IPropertyMetadata[];
}

export interface IComponentSettingsEditor<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> {
  value: TModel;
  onChange: (value: TModel) => void;
  readOnly: boolean;
}

export type IComponentSettingsEditorsCache = Record<string, ISettingsFormFactory>;
