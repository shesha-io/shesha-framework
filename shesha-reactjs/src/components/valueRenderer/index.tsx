import { IPropertyMetadata } from "@/interfaces/metadata";
import moment, { MomentInput } from "moment";
import { useReferenceList, useReferenceListItem } from "@/providers/referenceListDispatcher/index";
import React, { useMemo, FC, useState, useEffect, ReactNode } from "react";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { asNumber } from "../dataTable/cell/utils";
import { getFirstNonEmptyStringPropertyOrUndefined } from "@/utils/object";
import { IErrorInfo } from "@/interfaces";
import { makeErrorWithMessage } from "@/utils/errors";
import { isPromise } from "@/utils/promises";

type RefListRenderer = {
  referenceListName: string;
  referenceListModule: string;
};

interface ValueWithMetadata<V = unknown> {
  value: V;
  meta: IPropertyMetadata | undefined;
}

const ReferenceListDisplay: FC<ValueWithMetadata<number> & RefListRenderer> = ({ value, referenceListName, referenceListModule }) => {
  const item = useReferenceListItem(referenceListModule, referenceListName, value);
  return <>{item.data?.item}</>;
};

const EntityDisplay: FC<ValueWithMetadata> = ({ value }) => {
  if (!isDefined(value))
    return null;

  const text = typeof value === 'object'
    ? getFirstNonEmptyStringPropertyOrUndefined(value, ["displayText", "_displayName"])
    : value.toString();

  return <>{text}</>;
};

const MultivalueReferenceListDisplayInternal: FC<ValueWithMetadata & RefListRenderer> = (props) => {
  const { value, referenceListName, referenceListModule } = props;

  const list = useReferenceList({ module: referenceListModule, name: referenceListName });
  const refListItems = list.data?.items;

  const mapped = useMemo(() => {
    if (!refListItems || !Array.isArray(refListItems) ||
      !isDefined(value) || !Array.isArray(value))
      return null;

    const mappedArray = value.map((item) => refListItems.find((i) => i.itemValue === item)?.item);
    return mappedArray.join(", ");
  }, [refListItems, value]);

  return <>{mapped}</>;
};

const MultivalueReferenceListDisplay: FC<ValueWithMetadata> = (props) => {
  const { value, meta } = props;
  return isDefined(value) && meta && !isNullOrWhiteSpace(meta.referenceListModule) && !isNullOrWhiteSpace(meta.referenceListName)
    ? (<MultivalueReferenceListDisplayInternal {...props} referenceListName={meta.referenceListName} referenceListModule={meta.referenceListModule} />)
    : null;
};

const renderValue = <V = unknown>(props: ValueWithMetadata<V>): ReactNode => {
  const { value, meta } = props;

  if (!isDefined(value))
    return null;

  switch (meta?.dataType) {
    case 'number': return (<>{value.toString()}</>);
    case 'date': return (<>{moment(value).format(!isNullOrWhiteSpace(meta.dataFormat) ? meta.dataFormat : 'DD/MM/YYYY')}</>);
    case 'date-time': return (<>{moment(value).format(!isNullOrWhiteSpace(meta.dataFormat) ? meta.dataFormat : 'DD/MM/YYYY HH:mm')}</>);
    case 'time': {
      const momentValue = typeof value === 'number'
        ? moment.utc(value * 1000)
        : moment(value as MomentInput);
      return momentValue.isValid()
        ? <>{momentValue.format(!isNullOrWhiteSpace(meta.dataFormat) ? meta.dataFormat : 'HH:mm')}</>
        : null;
    };
    case 'reference-list-item':
      const numberValue = asNumber(value);
      return isDefined(numberValue) && !isNullOrWhiteSpace(meta.referenceListModule) && !isNullOrWhiteSpace(meta.referenceListName)
        ? (<ReferenceListDisplay {...props} value={numberValue} referenceListName={meta.referenceListName} referenceListModule={meta.referenceListModule} />)
        : undefined;
    case 'boolean': return <>{Boolean(props.value) ? 'Yes' : 'No'}</>;
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

export interface ValueRendererProps<V = unknown> {
  value: V;
  meta: Promise<IPropertyMetadata | undefined> | IPropertyMetadata | undefined;
}
export const ValueRenderer: FC<ValueRendererProps> = ({ meta, value }) => {
  const [metadata, setMetadata] = useState<IPropertyMetadata | undefined>(() => {
    return isPromise(meta) ? undefined : meta;
  });
  const [loading, setLoading] = useState<boolean>(isPromise(meta));
  const [error, setError] = useState<IErrorInfo | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (isDefined(meta) && isPromise(meta)) {
      const fetchMetadataAsync = async (): Promise<void> => {
        setLoading(true);
        setError(undefined);
        try {
          const result = await meta;
          if (isMounted) {
            setMetadata(result);
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError(makeErrorWithMessage(err, "Error loading metadata"));
            setLoading(false);
          }
        }
      };

      void fetchMetadataAsync();
    }

    return () => {
      isMounted = false;
    };
  }, [meta]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return renderValue({ value, meta: metadata });
};
