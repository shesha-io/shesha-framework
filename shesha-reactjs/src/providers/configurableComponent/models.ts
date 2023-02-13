export interface IConfigurableComponentProps {
  id?: string;
  name?: string;
  description?: string;
}

export declare type StoreValue = any;
export interface Store {
  [name: string]: StoreValue;
}