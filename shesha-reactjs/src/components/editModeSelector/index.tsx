import { EditMode } from '@/interfaces';
import { Select } from 'antd';
import React, { FC } from 'react';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | EditMode;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
}

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {
  
  const val: EditMode = props.value === false
    ? 'readOnly'
    : !props.value || props.value === true
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

export default EditModeSelector;