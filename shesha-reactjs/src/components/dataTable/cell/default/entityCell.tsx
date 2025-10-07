import React from 'react';
import { IDataCellProps } from '../interfaces';

export interface IEntityCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {}

export const EntityCell = <D extends object = {}, V = any>(props: IEntityCellProps<D, V>): JSX.Element => {
  const { value } = props;
  if (!value) return null;

  const text = typeof value === 'object' ? value['displayText'] ?? value['_displayName'] : value.toString();

  return <>{text}</>;
};

export default EntityCell;
