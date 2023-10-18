import { IComponentMetadata } from 'providers';
import { IComponentWrapperProps } from './interfaces';

export const asNumber = (value: any): number => {
  return typeof value === 'number' ? value : null;
};

export const getInjectables = ({ defaultRow, defaultValue }: IComponentWrapperProps) => {
  let result: IComponentMetadata = {};

  if (defaultRow) result = { ...result, injectedTableRow: defaultRow };

  if (defaultValue) result = { ...result, injectedDefaultValue: defaultValue };

  return result;
};
