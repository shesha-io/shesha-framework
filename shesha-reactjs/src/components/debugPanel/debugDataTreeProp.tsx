import React, { FC } from "react";
import { Checkbox, Col, Input, InputNumber, Popover, Row } from "antd";
import { IDebugDataTreeItemProps } from "./model";

export const DebugDataTreeProp: FC<IDebugDataTreeItemProps> = (props) => {
  return (
    <Row>
      <Col span={6}>
        <Popover content={`${props.name}${props.metadata?.description ? ` (${props.metadata?.description})` : ''}`}>
          {props.name}{props.onChange ? ':' : ''}
        </Popover>
      </Col>
      <Col span={18}>
        {props.onChange
          ? props.metadata?.dataType === 'number' || typeof props.value === 'number'
            ? (
              <InputNumber
                readOnly={props.readonly}
                style={{ fontSize: 14 }}
                value={props.value}
                onChange={(e) => {
                  if (props.onChange)
                    props.onChange(e);
                }}
              />
            )
            : props.metadata?.dataType === 'boolean' || typeof props.value === 'boolean'
              ? (
                <Checkbox
                  disabled={props.readonly}
                  style={{ fontSize: 14 }}
                  checked={props.value}
                  onChange={(e) => {
                    if (props.onChange)
                      props.onChange(e.target.checked);
                  }}
                />
              )
              : (
                <Input
                  readOnly={props.readonly}
                  style={{ fontSize: 14 }}
                  value={props.value?.toString()}
                  onChange={(e) => {
                    if (props.onChange)
                      props.onChange(e.target.value);
                  }}
                />
              )
          : props.value?.toString()}
      </Col>
    </Row>
  );
};
