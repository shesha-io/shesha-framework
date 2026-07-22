export interface IConfigurableComponentProps {
  id?: string;
  name?: string;
  description?: string;
}

export declare type StoreValue = unknown;
export interface Store {
  [name: string]: StoreValue;
}
