import React, { ReactNode, useMemo } from 'react';
import { IDataCellProps } from '../interfaces';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { asNumber } from '../utils';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export type IMultivalueReferenceListCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

type MultivalueReferenceListCellInternalProps = {
  value: Array<number>;
  referenceListName: string;
  referenceListModule: string;
};

const MultivalueReferenceListCellInternal = (props: MultivalueReferenceListCellInternalProps): ReactNode => {
  const { value, referenceListName, referenceListModule } = props;

  const list = useReferenceList({ module: referenceListModule, name: referenceListName });
  const refListItems = list.data?.items;

  const mapped = useMemo(() => {
    if (!isNonEmptyArray(refListItems))
      return null;

    const mappedArray = value
      .map((item) => {
        const numericValue = asNumber(item);
        const found = !isDefined(numericValue)
          ? null
          : refListItems.find((i) => i.itemValue === numericValue);
        return found?.item || null;
      })
      .filter((item) => isDefined(item));
    return mappedArray.join(', ');
  }, [refListItems, value]);

  return <>{mapped}</>;
};

export const MultivalueReferenceListCell = <D extends object = object, V = unknown>(
  props: IMultivalueReferenceListCellProps<D, V>,
): ReactNode => {
  const { value } = props;
  const { referenceListModule, referenceListName } = props.columnConfig;

  return Array.isArray(value) && isNonEmptyArray(value) && !isNullOrWhiteSpace(referenceListModule) && !isNullOrWhiteSpace(referenceListName)
    ? <MultivalueReferenceListCellInternal value={value} referenceListModule={referenceListModule} referenceListName={referenceListName} />
    : undefined;
};
