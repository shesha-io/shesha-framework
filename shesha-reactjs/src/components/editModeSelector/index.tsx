import { EditMode } from '@/interfaces';
import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | EditMode;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
  size?: 'small' | 'middle' | 'large';
  defaultValue?: EditMode;
}

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {
  const { value, defaultValue, onChange, size, readOnly } = props;

  const finalValue = defaultValue !== undefined ? defaultValue : value;

  const getEditModeValue = (val: boolean | EditMode | undefined): EditMode => {
    if (val === false) {
      return 'readOnly';
    }
    if (val === true || val === undefined) {
      return 'inherited';
    }
    return val;
  };

  const editModeValue = getEditModeValue(finalValue);

  return (
    <Radio.Group
      buttonStyle='solid'
      value={editModeValue}
      onChange={(e) => onChange?.(e.target.value)}
      size={size}
      disabled={readOnly}
    >
      <Radio.Button key='editable' value='editable'>
        <Icon icon='editIcon' hint='Editable' />
      </Radio.Button>
      <Radio.Button key='readOnly' value='readOnly'>
        <Icon icon='readonlyIcon' hint='Read only' />
      </Radio.Button>
      <Radio.Button key='inherited' value='inherited'>
        <Icon icon='inheritIcon' hint='Inherited' />
      </Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;