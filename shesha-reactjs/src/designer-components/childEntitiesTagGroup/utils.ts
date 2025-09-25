import { IChildEntitiesTagGroupSelectOptions } from './models';

export const addChildEntitiesTagGroupOption = (
  values: IChildEntitiesTagGroupSelectOptions[],
  option: IChildEntitiesTagGroupSelectOptions
) =>
  values.some(({ value }) => value === option?.value)
    ? values.map((item) => (item?.value === option?.value ? option : item))
    : [...values, option];

export const filterObjFromKeys = (value: object, keys: string[] = []) =>
  keys.length > 0
    ? Object.entries(value || {})
      .filter(([key]) => keys.includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {})
    : value;

/* export const morphChildEntitiesTagGroup = (
  values: IChildEntitiesTagGroupSelectOptions[],
  origin: object[] | object,
  keys: string[] = []
) => {
  if (values.length) {
    if (Array.isArray(origin) && origin.length) {
      return values.map(({ data: metadata }) => metadata).map(i => ({ ...filterObjFromKeys(origin[0], keys), ...i }));
    }

    if (Object.getOwnPropertyNames(origin || {})) {
      return values.map(({ data: metadata }) => metadata).map(i => ({ ...filterObjFromKeys(origin, keys), ...i }));
    }

    return values.map(({ data: metadata }) => metadata);
  }

  if (Array.isArray(origin) && origin.length) {
    return filterObjFromKeys(origin[0], keys);
  }

  return origin;
};*/
