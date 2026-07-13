import { IPropertyMetadata } from "@/interfaces/metadata";
import moment, { MomentInput } from "moment";
import { useReferenceList, useReferenceListItem } from "@/providers/referenceListDispatcher/index";
import React, { useMemo, FC } from "react";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { asNumber } from "../dataTable/cell/utils";
import { getFirstNonEmptyStringPropertyOrUndefined } from "@/utils/object";

export interface ValueRendererProps<V = unknown> {
  value: V;
  meta: IPropertyMetadata | undefined;
}

type RefListRenderer = {
  referenceListName: string;
  referenceListModule: string;
};

const ReferenceListDisplay: FC<ValueRendererProps<number> & RefListRenderer> = ({ value, referenceListName, referenceListModule }) => {
  const item = useReferenceListItem(referenceListModule, referenceListName, value);
  return <>{item.data?.item}</>;
};

const EntityDisplay: FC<ValueRendererProps> = ({ value }) => {
  if (!value)
    return null;

  const text = typeof value === 'object'
    ? getFirstNonEmptyStringPropertyOrUndefined(value, ["displayText", "_displayName"])
    : value.toString();

  return <>{text}</>;
};

const MultivalueReferenceListDisplayInternal: FC<ValueRendererProps & RefListRenderer> = (props) => {
  const { value, referenceListName, referenceListModule } = props;

  const list = useReferenceList({ module: referenceListModule, name: referenceListName });
  const refListItems = list.data?.items;

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
  const { value, meta } = props;
  return value && meta && !isNullOrWhiteSpace(meta.referenceListModule) && !isNullOrWhiteSpace(meta.referenceListName)
    ? (<MultivalueReferenceListDisplayInternal {...props} referenceListName={meta.referenceListName} referenceListModule={meta.referenceListModule} />)
    : null;
};

export const ValueRenderer: FC<ValueRendererProps> = (props) => {
  const { value, meta } = props;

  if (!isDefined(value))
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
      return numberValue && !isNullOrWhiteSpace(meta.referenceListModule) && !isNullOrWhiteSpace(meta.referenceListName)
        ? (<ReferenceListDisplay {...props} value={numberValue} referenceListName={meta.referenceListName} referenceListModule={meta.referenceListModule} />)
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
