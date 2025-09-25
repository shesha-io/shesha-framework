import { DataNode } from "antd/lib/tree";
import { IDictionary } from "@/interfaces";

export interface ModuleDto {
  id: string;
  name: string;
  description?: string;
}
export interface ApplicationDto {
  id: string;
  appKey: string;
  name: string;
}
export interface ConfigurationItemDto {
  id?: string;
  name: string;
  module?: ModuleDto;
  application?: ApplicationDto;
  itemType: string;

  label?: string;
  description?: string;
}

export interface IModule {
  id: string;
  name: string;
  description?: string;
  itemTypes: ItemTypeDictionary;
}
export interface IItemType {
  name: string;
  items: IConfigurationItem[];
  applications: IDictionary<IApplication>;
}
export interface IApplication {
  appKey: string;
  name: string;
  items: IConfigurationItem[];
}
export interface IConfigurationItem {
  id: string;
  name: string;
  label?: string;
  description?: string;
}
export type ItemTypeDictionary = IDictionary<IItemType>;
export type ModulesDictionary = IDictionary<IModule>;

export interface ConfigItemDataNode extends DataNode {
  itemId?: string;
}
