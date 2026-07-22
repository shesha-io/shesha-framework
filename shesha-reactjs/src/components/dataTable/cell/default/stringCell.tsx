import React from 'react';
import { IDataCellProps } from '../interfaces';
import NodeOrFuncRenderer from '@/components/nodeOrFuncRenderer';

export type IStringCellProps<D extends object, V = unknown> = IDataCellProps<D, V>;

export const StringCell = <D extends object, V = unknown>(props: IStringCellProps<D, V>): React.JSX.Element => {
  return <NodeOrFuncRenderer>{props.value ? String(props.value) : undefined}</NodeOrFuncRenderer>;
};

export default StringCell;
