import { FormInstance } from 'antd';
import { YesNoInherit } from '@/interfaces/formDesigner';
import { FormFullName, FormIdentifier, FormMode } from '@/providers/form/models';
import { isFormFullName, isFormRawId } from '@/providers/form/utils';
import { isNumeric } from './string';
import { isDefined } from './nullables';

interface IDataWithFields {
  _formFields: string[];
  [key: string]: unknown;
}

export const GHOST_PAYLOAD_KEY = '_&@#GH0ST';

export const getFieldNames = (data: object): string[] => {
  const processContainer = (container: unknown, containerName: string, fieldsList: string[]): void => {
    if (!container) return;
    if (containerName) fieldsList.push(containerName);

    if (typeof container === 'object' && !(container instanceof Date) && !(container instanceof File)) {
      Object.keys(container).forEach((key) => {
        if (container.hasOwnProperty(key))
          processContainer((container as Record<string, unknown>)[key], containerName ? `${containerName}.${key}` : key, fieldsList);
      });
    }
  };

  const result: string[] = [];
  processContainer(data, "", result);
  return result;
};

export function addFormFieldsList<TData = object>(
  formData: TData,
  nonFormData: object,
  form: FormInstance,
): IDataWithFields {
  const formFields: string[] = [];

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

const buildFormData = (formData: FormData, data: unknown, parentKey: string | undefined): void => {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach((key) => {
      buildFormData(formData, (data as Record<string, unknown>)[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    const value = isDefined(data) ? data : '';
    if (parentKey)
      formData.append(parentKey, value.toString());
  }
};

export const jsonToFormData = (data: unknown): FormData => {
  const formData = new FormData();

  buildFormData(formData, data, undefined);

  return formData;
};

export const hasFiles = (data: object): boolean => {
  const firstItem = Object.keys(data).find((key) => {
    const propValue = (data as Record<string, unknown>)[key];
    return propValue instanceof File || (typeof (propValue) === "object" && isDefined(propValue) && hasFiles(propValue));
  });

  return isDefined(firstItem);
};

const hasGhostKeys = (data: object): boolean => isDefined(data) && Object.entries(data).some(([key]) => key.includes(GHOST_PAYLOAD_KEY));

// TODO: remove GHOST_PAYLOAD_KEY and all functions that use it
export const removeGhostKeys = <TData extends object = object>(data: TData): TData => {
  if (!hasGhostKeys(data))
    return data;

  const entries = Object.entries(data)
    .filter(([key]) => !key.includes(GHOST_PAYLOAD_KEY))
    .map(([key, value]) => {
      if (key === '_formFields' && isDefined(value)) {
        const formFields = (value as string[]).filter((i) => !i.includes(GHOST_PAYLOAD_KEY));
        return [[key], formFields];
      }

      return [[key], value];
    });

  const result = entries.reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value as unknown } }), {});

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
};

export const getFormCacheKey = (formId: FormIdentifier): string | undefined => {
  const formKey = isFormRawId(formId)
    ? formId
    : isFormFullName(formId)
      ? `${formId.module}/${formId.name}`
      : undefined;

  return formKey;
};

export const getFormFullNameDisplayText = (formId: FormFullName): string => {
  return `${formId.module}/${formId.name}`;
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
