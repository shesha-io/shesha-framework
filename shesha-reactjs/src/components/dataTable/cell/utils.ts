import { IComponentMetadata } from 'providers';
import { IComponentWrapperProps } from './interfaces';

export const asNumber = (value: any): number => {
  return typeof value === 'number' ? value : null;
};

export const getInjectables = ({ defaultRow, defaultValue }: IComponentWrapperProps) => {
  let result: IComponentMetadata = {};

  /** Adds injectedTableRow to result if applicable **/
  if (defaultRow) result = { ...result, injectedTableRow: defaultRow };

  /** Adds injectedDefaultValue to result if applicable **/
  if (defaultValue) result = { ...result, injectedDefaultValue: defaultValue };

  return result;
};
