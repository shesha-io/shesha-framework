import React from 'react';
import { IDataCellProps } from '../interfaces';
import NodeOrFuncRenderer from '@/components/nodeOrFuncRenderer';

export interface IStringCellProps<D extends object, V extends any> extends IDataCellProps<D, V> {}

export const StringCell = <D extends object, V extends any>(props: IStringCellProps<D, V>): JSX.Element => {
  return <NodeOrFuncRenderer>{props.value}</NodeOrFuncRenderer>;
};

export default StringCell;
