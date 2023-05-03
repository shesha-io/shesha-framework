import React from 'react';
import { IDataCellProps } from '../interfaces';


export interface INumberCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {
}

export const NumberCell = <D extends object = {}, V = any>(props: INumberCellProps<D, V>) => {
    return <>{props.value}</>;
};

export default NumberCell;