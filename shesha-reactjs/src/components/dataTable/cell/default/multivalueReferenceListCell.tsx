import { useReferenceList } from 'providers/referenceListDispatcher';
import React, { useMemo } from 'react';
import { IDataCellProps } from '../interfaces';

export interface IMultivalueReferenceListCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {
}

export const MultivalueReferenceListCell = <D extends object = {}, V = any>(props: IMultivalueReferenceListCellProps<D, V>) => {
    const { value } = props;
    if (!value || !props.columnConfig)
        return null;

    const { referenceListName, referenceListModule } = props.columnConfig;

    const list = useReferenceList({ module: referenceListModule, name: referenceListName });
    const refListItems = list?.data?.items;

    const mapped = useMemo(() => {
        if (!refListItems || !Array.isArray(refListItems) ||
            !value || !Array.isArray(value))
            return null;

        const mappedArray = value.map(item => refListItems.find(i => i.itemValue === item)?.item);
        return mappedArray.join(", ");
    }, [refListItems, value]);

    return <>{mapped}</>;
};

export default MultivalueReferenceListCell;