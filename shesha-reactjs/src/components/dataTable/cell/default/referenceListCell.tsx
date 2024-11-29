import React from 'react';
import { asNumber } from '../utils';
import { IDataCellProps } from '../interfaces';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';

export interface IReferenceListCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> { }

const ReferenceListCellInternal = <D extends object = {}, V = any>(props: IReferenceListCellProps<D, V>) => {
  const itemValue = asNumber(props.value);
  const { referenceListName, referenceListModule } = props.columnConfig;

  const item = useReferenceListItem(referenceListModule, referenceListName, itemValue);
  return <>{item?.data?.item}</>;
};

export const ReferenceListCell = <D extends object = {}, V = any>(props: IReferenceListCellProps<D, V>) => {
  const itemValue = asNumber(props.value);
  if (typeof itemValue === 'undefined' || itemValue === null || !props.columnConfig) return null;

  return (<ReferenceListCellInternal {...props} />);
};