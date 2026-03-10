import { FormInstance } from 'antd';
import { YesNoInherit } from '@/interfaces/formDesigner';
import { FormIdentifier, FormMode } from '@/providers/form/models';
import { isFormFullName, isFormRawId } from '@/providers/form/utils';
import { isNumeric } from './string';

interface IDataWithFields {
  _formFields: string[];
  [key: string]: any;
}

export const GHOST_PAYLOAD_KEY = '_&@#GH0ST';

export const getFieldNames = (data: object): string[] => {
  const processContainer = (container: any, containerName: string, fieldsList: string[]): void => {
    if (!container) return;
    if (containerName) fieldsList.push(containerName);

    if (container && typeof container === 'object' && !(container instanceof Date) && !(container instanceof File)) {
      Object.keys(container).forEach((key) => {
        if (container.hasOwnProperty(key))
          processContainer(container[key], containerName ? `${containerName}.${key}` : key, fieldsList);
      });
    }
  };

  const result: string[] = [];
  processContainer(data, null, result);
  return result;
};

export function addFormFieldsList<TData = any>(
  formData: TData,
  nonFormData: object,
  form: FormInstance,
): IDataWithFields {
  const formFields = [];

  // call getFieldsValue to get a fileds list
  form.getFieldsValue(true, (meta) => {
    formFields.push(meta.name.join('.'));

    return false;
  });

  const nonFormFields = getFieldNames(nonFormData);

  const allFields = [...new Set(formFields.concat(nonFormFields))];

  return { _formFields: allFields, ...formData, ...nonFormData };
}

export const getFormFullName = (moduleName: string | null, name: string): string => {
  return moduleName ? `${moduleName}/${name}` : name;
};

export const appendFormData = (formData: FormData, key: string, data: unknown): void => {
  if (typeof data === 'object' || Array.isArray(data)) {
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        appendFormData(formData, key + '[' + i + ']', data[i]);
      }
    }
  } else {
    formData.append(key, data?.toString());
  }
};

const buildFormData = (formData, data, parentKey): void => {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach((key) => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    const value = data == null ? '' : data;

    formData.append(parentKey, value);
  }
};

export const jsonToFormData = (data: unknown): FormData => {
  const formData = new FormData();

  buildFormData(formData, data, undefined);

  return formData;
};

export const hasFiles = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;

  const hasFile = Object.keys(data).find((key) => {
    const propValue = data[key];
    return propValue instanceof File || hasFiles(propValue);
  });

  return hasFile !== null && hasFile !== undefined; // note: can't check for Boolean(*) because the key may be an empty string
};

const hasGhostKeys = (form: any): boolean => Boolean(form) && Object.entries(form).some(([key]) => key.includes(GHOST_PAYLOAD_KEY));

// TODO: remove GHOST_PAYLOAD_KEY and all functions that use it
export const removeGhostKeys = <TData extends object = object>(data: TData): TData => {
  if (!hasGhostKeys(data))
    return data;

  const entries = Object.entries(data || {})
    .filter(([key]) => !key.includes(GHOST_PAYLOAD_KEY))
    .map(([key, value]) => {
      if (key === '_formFields') {
        return [[key], ((value as string[]) || [])?.filter((i) => !i.includes(GHOST_PAYLOAD_KEY))];
      }

      return [[key], value];
    });

  const result = entries.reduce((acc, [key, value]) => ({ ...acc, ...{ [key as string]: value } }), {});

  return result as TData;
};

export const evaluateYesNo = (
  value: YesNoInherit,
  formMode: FormMode,
): boolean => {
  switch (value) {
    case 'yes':
      return true;
    case 'no':
      return false;
    case 'inherit':
      return formMode === 'edit';
  }
  return false;
};

export const getFormCacheKey = (formId: FormIdentifier): string => {
  const formKey = isFormRawId(formId)
    ? formId
    : isFormFullName(formId)
      ? `${formId.module}/${formId.name}`
      : undefined;

  return formKey;
};

/**
 * Convert size value (numeric or string) to a valid css property value. Numeric values are converted to pixels, string values remain as is.
 */
export const toSizeCssProp = (value: string | number): string | undefined => {
  return (typeof (value) === 'string' && isNumeric(value)) || typeof (value) === 'number'
    ? `${value}px`
    : Boolean(value)
      ? value
      : undefined;
};
