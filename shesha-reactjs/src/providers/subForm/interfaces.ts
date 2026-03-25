import { ColProps } from 'antd';
import { FormMarkupWithSettings, IChangeable, IValuable } from '@/interfaces';
import { FormIdentifier } from '../form/models';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';

export interface ISubFormProviderProps<TValue extends object = object> extends IValuable<TValue>, IChangeable {
  context?: string;

  propertyName?: string;
  markup?: FormMarkupWithSettings;
  // value?: string | { id: string; [key: string]: unknown };

  dataSourceUrl?: string;
  id: string;
  componentName?: string;

  formSelectionMode?: 'name' | 'dynamic';
  formType?: string | undefined;

  formId?: FormIdentifier | undefined;

  labelCol?: ColProps | undefined;
  wrapperCol?: ColProps | undefined;
  dataSource?: 'form' | 'api';
  apiMode?: 'entityName' | 'url';
  entityType?: string | IEntityTypeIdentifier;
  properties?: string | string[];
  queryParams?: string;

  //#region Actions
  onCreated?: string;
  onUpdated?: string;
  //#endregion

  //#region URLs
  /** Optional */
  getUrl?: string;
  postUrl?: string;
  putUrl?: string;
  //#endregion

  readOnly?: boolean;
}

export interface IProperty {
  label: string;
  propertyName: string;
  dataType: string;
}
