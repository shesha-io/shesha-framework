import { nanoid } from 'nanoid';
import { IFormDto } from '../../../..';
import { IPersistedFormProps } from '../../../../providers/formPersisterProvider/models';
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

export const formatOptions = (
  values: any,
  fn: Function,
  keys: string[],
  initialValue: IChildEntitiesTagGroupSelectOptions = null
) => {
  const label = getPropertyHolder(values);

  if (Array.isArray(values)) {
    const id = nanoid();
    return {
      label: fn(getExpressionLabel(values, keys)) ?? label,
      value: id,
      metadata: values.map(i => formatOptions(i, fn, keys, initialValue)),
    };
  }

  delete values?.['_formFields'];

  return {
    label: fn(getExpressionLabel(values, keys)) ?? label,
    value: initialValue?.value ?? nanoid(),
    metadata: values,
  };
};

export const getChildEntitiesFormInfo = (formInfo: IFormDto): IPersistedFormProps => ({
  ...formInfo,
  formSettings: formInfo?.settings,
});

export const getExpressionLabel = (values: object, keys: string[]) =>
  keys
    .map(i => [i, values?.[i]])
    .filter(([k, v]) => k && v)
    .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {});

export const getInitChildEntitiesTagGroupOptions = (
  form: any[] | object | null,
  fn: Function,
  keys: string[]
): IChildEntitiesTagGroupSelectOptions[] => {
  if (Array.isArray(form))
    return (form || []).map(i => ({
      value: nanoid(),
      label: fn(getExpressionLabel(i, keys)) ?? getPropertyHolder(form, i),
      metadata: i,
    }));

  return [];
};

export const getPropertyHolder = (values: object[] | object, item: object = values) => {
  try {
    const list = Array.isArray(values) ? values[0] : values;
    const key = Object.getOwnPropertyNames(list || {}).filter(i => !i.startsWith('_'))[0];

    return item?.[key] ?? nanoid();
  } catch (_e) {
    return nanoid();
  }
};

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
