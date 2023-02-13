import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DisplayFormItem, ShaSpin } from '../../';
import React, { FC } from 'react';
import { useReferenceList } from '../../providers/referenceListDispatcher';
import { getLegacyReferenceListIdentifier } from '../../utils/referenceList';

export interface IMultiReadCheckBoxRefListProps {
  readonly listName: string;
  readonly listNamespace: string;
  readonly value?: number;
  readonly display?: 'boolean' | 'check' | 'component' | 'yn';
}

export const binaryToList = (val: number) => {
  const total = [];
  let currentVal = 1;

  while (currentVal <= val) {
    /* tslint:disable:no-bitwise */
    if ((val & currentVal) === currentVal) total.push(currentVal);
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

  const result = refList?.items?.map(i => ({ ...i, checked: list.includes(i?.itemValue) }));

  const displayText = (checked: boolean) => {
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
      {result?.map(({ item, checked }) => (
        <DisplayFormItem label={item}>{displayText(checked)}</DisplayFormItem>
      ))}
    </ShaSpin>
  );
};

export default MultiReadCheckBoxRefList;
