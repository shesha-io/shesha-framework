import React from 'react';
import { IDataCellProps } from '../interfaces';

export interface IStringCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {
}

export const StringCell = <D extends object = {}, V = any>(props: IStringCellProps<D, V>) => {
    return <>{props.value}</>;
};

export default StringCell;