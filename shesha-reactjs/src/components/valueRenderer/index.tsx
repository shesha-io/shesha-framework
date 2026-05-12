import { IPropertyMetadata } from "@/interfaces/metadata";
import moment, { MomentInput } from "moment";
import { useReferenceList, useReferenceListItem } from "@/providers/referenceListDispatcher/index";
import React, { useMemo, FC } from "react";
import { isDefined } from "@/utils/nullables";
import { asNumber } from "../dataTable/cell/utils";


export interface ValueRendererProps<V = unknown> {
  value: V;
  meta: IPropertyMetadata | undefined;
}

const ReferenceListDisplay: FC<ValueRendererProps<number>> = ({ value, meta }) => {
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

const MultivalueReferenceListDisplayInternal: FC<ValueRendererProps> = (props) => {
  const { value } = props;

  const { referenceListName, referenceListModule } = props.meta;

  const list = useReferenceList({ module: referenceListModule, name: referenceListName });
  const refListItems = list?.data?.items;

  const mapped = useMemo(() => {
    if (!refListItems || !Array.isArray(refListItems) ||
      !value || !Array.isArray(value))
      return null;

    const mappedArray = value.map((item) => refListItems.find((i) => i.itemValue === item)?.item);
    return mappedArray.join(", ");
  }, [refListItems, value]);

  return <>{mapped}</>;
};

const MultivalueReferenceListDisplay: FC<ValueRendererProps> = (props) => {
  const { value } = props;

  return !value || !props.meta
    ? null
    : (<MultivalueReferenceListDisplayInternal {...props} />);
};

export const ValueRenderer: FC<ValueRendererProps> = (props) => {
  const { value, meta } = props;

  if (isDefined(value))
    return null;

  switch (meta?.dataType) {
    case 'number': return (<>{value.toString()}</>);
    case 'date': return (<>{moment(value).format(meta.dataFormat || 'DD/MM/YYYY')}</>);
    case 'date-time': return (<>{moment(value).format(meta.dataFormat || 'DD/MM/YYYY HH:mm')}</>);
    case 'time': {
      const momentValue = typeof value === 'number'
        ? moment.utc(value * 1000)
        : moment(value as MomentInput);
      return momentValue.isValid()
        ? <>{momentValue.format(meta.dataFormat || 'HH:mm')}</>
        : null;
    };
    case 'reference-list-item':
      const numberValue = asNumber(value);
      return numberValue
        ? (<ReferenceListDisplay {...props} value={numberValue} />)
        : undefined;
    case 'boolean': return <>{props.value ? 'Yes' : 'No'}</>;
    case 'entity': return (<EntityDisplay {...props} />);
    case 'array': {
      return meta.dataFormat === 'reference-list-item'
        ? <MultivalueReferenceListDisplay {...props} />
        : <>{value.toString()}</>;
    }
    case 'string': return <>{value.toString()}</>;
    default: return <>{value.toString()}</>;
  };
};
