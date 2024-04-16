import { ColProps } from 'antd';
import { FormMarkupWithSettings, IChangeable, IValuable } from '@/interfaces';
import { FormIdentifier } from '../form/models';

export interface ISubFormProviderProps extends IValuable, IChangeable {
  context?: string;

  propertyName?: string;
  markup?: FormMarkupWithSettings;
  value?: string | { id: string; [key: string]: any };

  dataSourceUrl?: string;
  id: string;
  componentName?: string;

  formSelectionMode?: 'name' | 'dynamic';
  formType?: string;

  formId?: FormIdentifier;

  buttons?: any[];
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  dataSource?: 'form' | 'api';
  apiMode?: 'entityName' | 'url';
  entityType?: string;
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
