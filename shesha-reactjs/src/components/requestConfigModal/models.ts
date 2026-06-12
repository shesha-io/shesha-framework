import { IPropertySetting } from '@/providers/form/models';

export type RequestValue = string | IPropertySetting<string>;

export interface IRequestParam {
  key: string;
  value: RequestValue;
  description?: string;
  enabled: boolean;
}

export interface IRequestHeader {
  key: string;
  value: RequestValue;
  enabled: boolean;
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'graphql';

export interface IGraphQLBody {
  query: string;
  variables?: string;
  operationName?: string;
}

export interface IRequestBody {
  type: BodyType;
  content: string | Record<string, any> | IGraphQLBody;
}

export interface IRequestConfig {
  params: IRequestParam[];
  headers: IRequestHeader[];
  body: IRequestBody;
}
