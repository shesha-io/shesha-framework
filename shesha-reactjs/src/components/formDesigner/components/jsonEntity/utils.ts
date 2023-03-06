import { nanoid } from 'nanoid';
import { IJsonEntityPayload, IJsonEntitySelectOptions } from './models';

export const addJsonEntityOption = (values: IJsonEntitySelectOptions[], option: IJsonEntitySelectOptions) => {
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

export const formatOptions = (values: any, key: string, initialValue: IJsonEntitySelectOptions = null) => {
  const properties = ['label', 'metadata', 'value'] as Array<keyof IJsonEntitySelectOptions>;
  const tempKey = getPropertyHolder(values);

  delete values?.['_formFields'];

  if (initialValue && properties.every(i => Object.keys(initialValue || {}).includes(i))) {
    return { label: values?.[key || tempKey], value: initialValue?.value, metadata: values };
  }

  return { label: values?.[key || tempKey], value: nanoid(), metadata: values };
};

export const getInitJsonEntityOptions = (
  form: IJsonEntityPayload<object[]>,
  label: string
): IJsonEntitySelectOptions[] =>
  (form?.value || []).map(i => ({ value: nanoid(), label: i?.[label || getPropertyHolder(form)], metadata: i }));

export const getPropertyHolder = (values: object) =>
  Object.getOwnPropertyNames(values || {})?.length
    ? Object.getOwnPropertyNames(values).filter(i => !i.startsWith('_'))[0]
    : 'name';

export const morphJsonEntity = (values: IJsonEntitySelectOptions[]) => ({
  value: values.map(({ metadata }) => metadata),
});
