import { EditMode } from '@/interfaces';
import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | EditMode;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
  size?: 'small' | 'middle' | 'large';
}

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {

  const val: EditMode = props.value === false
    ? 'readOnly'
    : !props.value || props.value === true
      ? 'inherited'
      : props.value;

  return (
    <Radio.Group buttonStyle='solid' value={val} onChange={(e) => props.onChange(e.target.value)} size={props.size} disabled={props.readOnly}>
      <Radio.Button key='editable' value="editable"><Icon icon='editIcon' hint='Editable' /></Radio.Button>
      <Radio.Button key='readOnly' value="readOnly"><Icon icon='readonlyIcon' hint='Read only' /></Radio.Button>
      <Radio.Button key='inherited' value="inherited"><Icon icon='inheritIcon' hint='Inherited' /></Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;