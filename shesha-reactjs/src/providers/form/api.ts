import { IToolboxComponents } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  FormIdentifier,
  IComponentsDictionary,
  IFlatComponentsStructure,
  IFormSettings,
  isConfigurableFormComponent,
} from './models';

/**
 * Form configuration DTO
 */
export interface FormConfigurationDto {
  id?: string;
  /**
   * Form path/id is used to identify a form
   */
  moduleId?: string | null;
  /**
   * Form name
   */
  name?: string | null;
  /**
   * Label
   */
  label?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Markup in JSON format
   */
  markup?: string | null;
  /**
   * Type of the form model
   */
  modelType?: string | null;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * Version status
   */
  versionStatus?: number;
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
  /**
   * Generation logic type name
   */
  generationLogicTypeName?: string | null;
}

export interface IFormFetcherProps {
  lazy: boolean;
}
export type UseFormConfigurationArgs = {
  formId: FormIdentifier;
} & IFormFetcherProps;

export interface FormInfo {
  id?: string;
  name?: string;
  module?: string;
  flatStructure: IFlatComponentsStructure;
  settings: IFormSettings;
}

// just for intrenal use
interface IFieldData {
  name: string;
  child: IFieldData[];
  property: IPropertyMetadata;
}

export const filterDataByOutputComponents = (
  data: object,
  components: IComponentsDictionary,
  toolboxComponents: IToolboxComponents,
): any => {
  const newData = { ...data };
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      var component = components[key];
      if (isConfigurableFormComponent(component) && component.propertyName &&
        component.type &&
        data.hasOwnProperty(component.propertyName) &&
        !toolboxComponents[component.type]?.isOutput) {
        delete data[component.propertyName];
      }
    }
  }

  return newData;
};

export const gqlFieldsToString = (fields: IFieldData[]): string => {
  const resf = (items: IFieldData[]): string => {
    let s = '';
    items.forEach((item) => {
      if (!(item.property ||
        item.name === 'id' ||
        item.name === '_className' ||
        item.name === '_displayName'
      )) return;
      s += s ? ',' + item.name : item.name;
      if (item.child.length > 0) {
        s += '{' + resf(item.child) + '}';
      }
    });

    return s;
  };

  return resf(fields);
};
