import { IConfigurableActionDescriptor } from "../../interfaces/configurableAction";

export interface IConfigurableActionDictionary {
  [key: string]: IConfigurableActionDescriptor[];
}

export interface IConfigurableActionGroup {
  ownerName: string;
  actions: IConfigurableActionDescriptor[]; 
}
export interface IConfigurableActionGroupDictionary {
  [key: string]: IConfigurableActionGroup;
}

export enum SheshaActionOwners {
  ConfigurationFramework = 'shesha.configurationFramework',
  Common = 'shesha.common',
  Form = 'shesha.form',
}