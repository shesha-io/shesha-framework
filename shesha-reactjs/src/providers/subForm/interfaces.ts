import { ColProps } from 'antd';
import { FormMarkupWithSettings, IChangeable, IValuable } from '@/interfaces';
import { FormIdentifier } from '../form/models';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';

export type SubFormApiMode = 'entityName' | 'url';

export interface ISubFormProviderProps<TValue extends object = object> extends IValuable<TValue>, IChangeable<TValue> {
  context?: string | undefined;

  propertyName?: string | undefined;
  markup?: FormMarkupWithSettings | undefined;

  dataSourceUrl?: string | undefined;
  id: string;
  componentName?: string | undefined;

  formSelectionMode?: 'name' | 'dynamic' | undefined;
  formType?: string | undefined | undefined;

  formId?: FormIdentifier | undefined | undefined;

  labelCol?: ColProps | undefined;
  wrapperCol?: ColProps | undefined;
  dataSource?: 'form' | 'api' | undefined;
  apiMode?: SubFormApiMode | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  properties?: string | string[] | undefined;
  queryParams?: string | undefined;

  //#region Actions
  onCreated?: string | undefined;
  onUpdated?: string | undefined;
  //#endregion

  //#region URLs
  /** Optional */
  getUrl?: string | undefined;
  postUrl?: string | undefined;
  putUrl?: string | undefined;
  //#endregion

  readOnly?: boolean | undefined;
}

export interface IProperty {
  label: string;
  propertyName: string;
  dataType: string;
}
