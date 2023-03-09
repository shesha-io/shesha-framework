import { nanoid } from 'nanoid';
import { IChildEntitiesTagGroupSelectOptions } from './models';

export const addChildEntitiesTagGroupOption = (
  values: IChildEntitiesTagGroupSelectOptions[],
  option: IChildEntitiesTagGroupSelectOptions
) => {
  const exists = values.some(({ value }) => value === option?.value);

  if (exists) {
    return values.map(i => {
      if (i?.value === option?.value) {
        return option;
      }

      return i;
    });
  }

  return [...values, option];
};

export const formatOptions = (values: any, key: string, initialValue: IChildEntitiesTagGroupSelectOptions = null) => {
  const tempKey = getPropertyHolder(values);

  if (Array.isArray(values)) {
    const id = nanoid();
    return { label: values?.[key || id], value: id, metadata: values.map(i => formatOptions(i, key, initialValue)) };
  }

  delete values?.['_formFields'];

  return { label: values?.[key || tempKey], value: initialValue?.value ?? nanoid(), metadata: values };
};

export const getInitChildEntitiesTagGroupOptions = (
  form: any[] | object | null,
  label: string
): IChildEntitiesTagGroupSelectOptions[] => {
  if (Array.isArray(form))
    return (form || []).map(i => ({ value: nanoid(), label: i?.[label || getPropertyHolder(form)], metadata: i }));

  return [];
};

export const getPropertyHolder = (values: object) =>
  Object.getOwnPropertyNames(values || {})?.length
    ? Object.getOwnPropertyNames(values).filter(i => !i.startsWith('_'))[0]
    : 'name';

export const morphChildEntitiesTagGroup = (
  values: IChildEntitiesTagGroupSelectOptions[],
  origin: object[] | object,
  keys: string[] = []
) => {
  if (values.length) {
    if (Array.isArray(origin) && origin.length) {
      return values.map(({ metadata }) => metadata).map(i => ({ ...filterObjFromKeys(origin[0], keys), ...i }));
    }

    if (Object.getOwnPropertyNames(origin || {})) {
      return values.map(({ metadata }) => metadata).map(i => ({ ...filterObjFromKeys(origin, keys), ...i }));
    }

    return values.map(({ metadata }) => metadata);
  }

  if (Array.isArray(origin) && origin.length) {
    return filterObjFromKeys(origin[0], keys);
  }

  return origin;
};

export const filterObjFromKeys = (value: object, keys: string[]) =>
  Object.entries(value || {})
    .filter(([key]) => keys.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {});
