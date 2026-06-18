import { ListEditor } from '@/components/listEditor';
import { ListItem } from '@/components/listEditor/models';
import React, { FC } from 'react';
import { KeyInfomationBarItemProps } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { Col, Input, InputNumber, Row, Select } from 'antd';
import { DefaultOptionType } from 'antd/es/select';

export interface IColumnsEditorProps {
  value: KeyInfomationBarItemProps[];
  onChange: (value: KeyInfomationBarItemProps[]) => void;
  readOnly: boolean;
}

const getOptions = (values: string[]): DefaultOptionType[] => {
  return values.map((value) => ({
    value: value,
    label: value.split('-').map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' '),
  }));
};

const textAlignValues = ['start', 'end', 'center', 'inherit'];
const textAlignOptions = getOptions(textAlignValues);
const flexDirectionValues = ['row', 'column', 'row-reverse', 'column-reverse'];
const flexDirectionOptions = getOptions(flexDirectionValues);


export const ColumnsEditor: FC<IColumnsEditorProps> = ({ value, onChange, readOnly }) => {
  return (
    <ListEditor<KeyInfomationBarItemProps & ListItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => ({
        id: nanoid(),
        width: 200,
        textAlign: 'center',
        flexDirection: "column",
        components: [],
        padding: '0px',
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
                value={item.width}
                onChange={(newValue) => {
                  itemOnChange({ ...item, width: newValue ?? 0 }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <Select
                placeholder="Text Align"
                title="Text Align"
                options={textAlignOptions}
                disabled={readOnly}
                value={item.textAlign}
                onChange={(newValue) => {
                  itemOnChange({ ...item, textAlign: newValue }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <Select
                placeholder="Flex Direction"
                title="Flex Direction"
                options={flexDirectionOptions}
                disabled={readOnly}
                value={item.flexDirection}
                onChange={(newValue) => {
                  itemOnChange({ ...item, flexDirection: newValue }, undefined);
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6} style={{ paddingRight: "5px" }}>
              <Input
                placeholder="Padding"
                title="Padding"
                disabled={readOnly}
                value={item.padding}
                onChange={(e) => {
                  itemOnChange({ ...item, padding: e.target.value }, undefined);
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
