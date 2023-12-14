import { ReadOnlyMode } from '@/index';
import { Select } from 'antd';
import React, { FC } from 'react';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | ReadOnlyMode;
  readOnly?: boolean;
  onChange?: (value: ReadOnlyMode) => void;
}

const ReadOnlyModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {
  
  const val: ReadOnlyMode = props.value === true
    ? 'readOnly'
    : !props.value
      ? 'inherited'
      : props.value;

  return (
    <Select disabled={props.readOnly} value={val} onChange={props.onChange}>
      <Select.Option key='editable' value="editable">Editable</Select.Option>
      <Select.Option key='readOnly' value="readOnly">Read only</Select.Option>
      <Select.Option key='inherited' value="inherited">Inherited</Select.Option>
    </Select>
  );
};

export default ReadOnlyModeSelector;