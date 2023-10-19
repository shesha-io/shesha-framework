import { IPropertyMetadata } from "interfaces/metadata";
import moment from "moment";
import { useReferenceList, useReferenceListItem } from "providers/referenceListDispatcher/index";
import React, { useMemo } from "react";
import { FC } from "react";
import { asNumber } from "../dataTable/cell/utils";

export interface ValueRendererProps {
    value: any;
    meta: IPropertyMetadata;
}

export const ValueRenderer: FC<ValueRendererProps> = (props) => {
    const { value, meta } = props;

    if (value === undefined || value === null)
        return null;

    switch (meta?.dataType) {
        case 'number': return (<>{value}</>);
        case 'date': return (<>{ moment(value).format(meta.dataFormat || 'DD/MM/YYYY') }</>);
        case 'date-time': return (<>{moment(value).format(meta.dataFormat || 'DD/MM/YYYY HH:mm')}</>);
        case 'time': {
            const numberValue = asNumber(value);
            return numberValue
                ? <>{moment.utc(numberValue * 1000).format(meta.dataFormat || 'HH:mm')}</>
                : null;
        };
        case 'reference-list-item': return (<ReferenceListDisplay {...props}/>);
        case 'boolean': return <>{props.value ? 'Yes' : 'No'}</>;
        case 'entity': return (<EntityDisplay {...props}/>);
        case 'array': {
            return meta.dataFormat === 'reference-list-item'
                ? <MultivalueReferenceListDisplay {...props} />
                : <>{value}</>;
        }
        case 'string': return <>{value}</>;
        default: return <>{value}</>;
    };
};

const ReferenceListDisplay: FC<ValueRendererProps> = ({ value, meta }) => {
    const { referenceListName, referenceListModule } = meta;
        
    const item = useReferenceListItem(referenceListModule, referenceListName, value);
    return <>{item?.data?.item}</>;
};

const EntityDisplay: FC<ValueRendererProps> = ({ value }) => {
    if (!value)
        return null;

    const text = typeof value === 'object'
        ? value['displayText'] ?? value['_displayName']
        : value.toString();

    return <>{text}</>;
};

const MultivalueReferenceListDisplay: FC<ValueRendererProps> = (props) => {
    const { value } = props;
    if (!value || !props.meta)
        return null;

    const { referenceListName, referenceListModule } = props.meta;

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