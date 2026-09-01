import { ReactNode } from 'react';
import { asNumber } from '../utils';
import { IDataCellProps } from '../interfaces';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export type IReferenceListCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

type ReferenceListCellInternalProps = {
  referenceListName: string;
  referenceListModule: string | null;
  value: number;
};
const ReferenceListCellInternal = (props: ReferenceListCellInternalProps): ReactNode => {
  const { referenceListName, referenceListModule, value } = props;

  const item = useReferenceListItem(referenceListModule, referenceListName, value);
  return <>{item.data?.item}</>;
};

export const ReferenceListCell = <D extends object = object, V = unknown>(props: IReferenceListCellProps<D, V>): ReactNode => {
  const itemValue = asNumber(props.value);
  const { referenceListModule, referenceListName } = props.columnConfig;

  // module is legitimately empty for legacy reference lists - only the name is required
  return isDefined(itemValue) && !isNullOrWhiteSpace(referenceListName)
    ? (
      <ReferenceListCellInternal
        value={itemValue}
        referenceListModule={referenceListModule ?? null}
        referenceListName={referenceListName}
      />
    )
    : undefined;
};
