export interface ISettingIdentifier {
  module: string;
  name: string;
}
export interface ISettingFullAccessor {
  module: string;
  category: string;
  name: string;
}

export interface ISettingsDictionary {
  [key: string]: Promise<any>;
}
