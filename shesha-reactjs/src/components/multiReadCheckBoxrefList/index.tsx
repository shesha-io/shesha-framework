import React, { FC, ReactNode } from 'react';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DisplayFormItem, ShaSpin } from '@/components';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { useReferenceList } from '@/providers/referenceListDispatcher';

export interface IMultiReadCheckBoxRefListProps {
  readonly listName: string;
  readonly listNamespace: string;
  readonly value?: number;
  readonly display?: 'boolean' | 'check' | 'component' | 'yn';
}

export const binaryToList = (val: number): number[] => {
  const total = [];
  let currentVal = 1;

  while (currentVal <= val) {
    if ((val & currentVal) === currentVal) total.push(currentVal);// eslint-disable-line no-bitwise
    currentVal *= 2;
  }

  return total;
};

export const MultiReadCheckBoxRefList: FC<IMultiReadCheckBoxRefListProps> = ({
  listName,
  listNamespace,
  value,
  display = 'component',
}) => {
  const { data: refList, loading: refListLoading } = useReferenceList(getLegacyReferenceListIdentifier(listNamespace, listName));

  const list = binaryToList(value);

  const result = refList?.items?.map((i) => ({ ...i, checked: list.includes(i?.itemValue) }));

  const displayText = (checked: boolean): ReactNode => {
    switch (display) {
      case 'boolean':
        return checked ? 'True' : 'False';
      case 'check':
        return checked ? 'Checked' : 'N/A';
      case 'component':
        return checked ? <CheckCircleOutlined /> : <MinusCircleOutlined />;
      case 'yn':
        return checked ? 'Yes' : 'No';

      default:
        return null;
    }
  };

  return (
    <ShaSpin spinning={refListLoading}>
      {result?.map(({ item, checked, id }) => (
        <DisplayFormItem label={item} key={id}>{displayText(checked)}</DisplayFormItem>
      ))}
    </ShaSpin>
  );
};

export default MultiReadCheckBoxRefList;
