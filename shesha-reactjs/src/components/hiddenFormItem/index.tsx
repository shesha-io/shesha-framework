import React, { FC } from 'react';
import { Form, Input } from 'antd';

interface IHiddenFormItemProps {
  name?: string;
}

/**
 * This is a field that is solely used to display fields in a form for example start and end dates and times
 *
 * @param name name property
 * @returns
 */
export const HiddenFormItem: FC<IHiddenFormItemProps> = ({ name }) => (
  <Form.Item name={name} style={{ display: 'none' }}>
    <Input type="hidden" />
  </Form.Item>
);
