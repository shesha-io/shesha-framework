import { Checkbox, Col, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ShaSpin } from '../../';
import React, { FC } from 'react';
import { useReferenceList } from '../../providers/referenceListDispatcher';
import { getLegacyReferenceListIdentifier } from '../../utils/referenceList';

export interface IMultiCheckBoxRefListProps {
  readonly listName: string;
  readonly listNamespace: string;
  readonly onChange?: (e: CheckboxChangeEvent, itemValue: number) => void;
  readonly columns?: 1 | 2 | 3 | 4;
}

export const MultiCheckBoxRefList: FC<IMultiCheckBoxRefListProps> = ({
  listName,
  listNamespace,
  onChange,
  columns = 3,
}) => {
  const { data: refList, loading: refListLoading } = useReferenceList(getLegacyReferenceListIdentifier(listNamespace, listName));

  return (
    <ShaSpin spinning={refListLoading}>
      <Row>
        {refList?.items?.map(({ item, itemValue }) => (
          <Col key={itemValue} span={24 / columns}>
            <Checkbox key={itemValue} onChange={e => onChange(e, itemValue)}>
              {item}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </ShaSpin>
  );
};

export default MultiCheckBoxRefList;
