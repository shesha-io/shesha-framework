import { ListEditor } from '@/components/listEditor';
import { ListItem } from '@/components/listEditor/models';
import { nanoid } from '@/utils/uuid';
import { Col, InputNumber, Row } from 'antd';
import React, { FC } from 'react';
import { IColumnProps } from './interfaces';

export interface IColumnsEditorProps {
  value: IColumnProps[];
  onChange: (value: IColumnProps[]) => void;
  readOnly: boolean;
}

export const ColumnsEditor: FC<IColumnsEditorProps> = ({ value, onChange, readOnly }) => {
  return (
    <ListEditor<IColumnProps & ListItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => ({
        id: nanoid(),
        flex: 6,
        offset: 0,
        push: 0,
        pull: 0,
        components: [],
      })}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => {
        return (
          <Row>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <InputNumber
                placeholder="Width"
                title="Width"
                disabled={readOnly}
                value={item.flex}
                onChange={(newValue) => {
                  itemOnChange({ ...item, flex: newValue ?? 0 }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <InputNumber
                placeholder="Offset"
                title="Offset"
                disabled={readOnly}
                value={item.offset}
                onChange={(newValue) => {
                  itemOnChange({ ...item, offset: newValue ?? 0 }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <InputNumber
                placeholder="Push"
                title="Push"
                disabled={readOnly}
                value={item.push}
                onChange={(newValue) => {
                  itemOnChange({ ...item, push: newValue ?? 0 }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <InputNumber
                placeholder="Pull"
                title="Pull"
                disabled={readOnly}
                value={item.pull}
                onChange={(newValue) => {
                  itemOnChange({ ...item, pull: newValue ?? 0 }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        );
      }}
    </ListEditor>
  );
};
