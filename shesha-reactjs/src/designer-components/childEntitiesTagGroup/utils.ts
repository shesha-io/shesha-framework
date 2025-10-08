import { IChildEntitiesTagGroupSelectOptions } from './models';

export const addChildEntitiesTagGroupOption = (
  values: IChildEntitiesTagGroupSelectOptions[],
  option: IChildEntitiesTagGroupSelectOptions,
): IChildEntitiesTagGroupSelectOptions[] =>
  values.some(({ value }) => value === option?.value)
    ? values.map((item) => (item?.value === option?.value ? option : item))
    : [...values, option];

export const filterObjFromKeys = (value: object, keys: string[] = []): object =>
  keys.length > 0
    ? Object.entries(value || {})
      .filter(([key]) => keys.includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {})
    : value;
