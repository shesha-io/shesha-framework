import React from 'react';
import { IDataCellProps } from '../interfaces';
import NodeOrFuncRenderer from '@/components/nodeOrFuncRenderer';

export type IStringCellProps<D extends object, V extends any> = IDataCellProps<D, V>;

export const StringCell = <D extends object, V extends any>(props: IStringCellProps<D, V>): JSX.Element => {
  return <NodeOrFuncRenderer>{props.value}</NodeOrFuncRenderer>;
};

export default StringCell;
