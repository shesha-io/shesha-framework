import { FormInstance } from 'antd';

interface IDataWithFields {
  _formFields: string[];
  [key: string]: any;
}

export function addFormFieldsList<TData = any>(formData: TData, nonFormData: object, form: FormInstance): IDataWithFields {
  const formFields = [];

  // call getFieldsValue to get a fileds list
  form.getFieldsValue(true, meta => {
    formFields.push(meta.name.join('.'));

    return false;
  });

  const nonFormFields = getFieldNames(nonFormData);
  
  const allFields = [...new Set(formFields.concat(nonFormFields))];

  return { _formFields: allFields, ...formData, ...nonFormData };
}

export const getFieldNames = (data: object): string[] => {
  
  const processContainer = (container: any, containerName: string, fieldsList: string[]) => {
    if (!container)
      return;
    if (containerName)
      fieldsList.push(containerName);

    if (container && typeof container === 'object' && !(container instanceof Date) && !(container instanceof File)) {
      Object.keys(container).forEach(key => {
        if (container.hasOwnProperty(key))
          processContainer(container[key], containerName ? `${containerName}.${key}` : key, fieldsList);
      });
    }
  }

  const result: string[] = [];
  processContainer(data, null, result);
  return result;
}

export const getFormFullName = (moduleName: string, name: string) => {
  return moduleName
    ? `${moduleName}/${name}`
    : name;
}

export const appendFormData = (formData: FormData, key: string, data: any) => {
  if (data === Object(data) || Array.isArray(data)) {
    for (var i in data) {
      appendFormData(formData, key + '[' + i + ']', data[i]);
    }
  } else {
    formData.append(key, data);
  }
}

const buildFormData = (formData, data, parentKey) => {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach(key => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    const value = data == null ? '' : data;

    formData.append(parentKey, value);
  }
}

export const jsonToFormData = (data: any): FormData => {
  const formData = new FormData();

  buildFormData(formData, data, undefined);

  return formData;
}

export const hasFiles = (data: any): boolean => {
  if (!data)
    return false;
  if (typeof data !== 'object')
    return false;

  const hasFile = Object.keys(data).find(key => {
    return Boolean(data[key] instanceof File) || Boolean(data[key]) && hasFiles(data[key]);
  });

  return Boolean(hasFile);
}