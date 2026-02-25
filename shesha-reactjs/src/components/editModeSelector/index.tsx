import { EditMode } from '@/interfaces';
import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | EditMode;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
  onGetAdditionalInfo?: (info: string) => void;
  size?: SizeType;
  className?: string;
}

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {
  const val: EditMode = props.value === false
    ? 'readOnly'
    : !props.value || props.value === true
      ? 'inherited'
      : props.value;

  if (typeof props.onGetAdditionalInfo === 'function') {
    return (
      <Radio.Group buttonStyle="solid" value={val} onChange={(e) => props.onChange(e.target.value)} size={props.size} disabled={props.readOnly} className={props.className}>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo('Editable')} key="editable" value="editable">
          <Icon icon="editIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo('Read only')} key="readOnly" value="readOnly">
          <Icon icon="readonlyIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo('Inherited')} key="inherited" value="inherited">
          <Icon icon="inheritIcon" />
        </Radio.Button>
      </Radio.Group>
    );
  }

  return (
    <Radio.Group buttonStyle="solid" value={val} onChange={(e) => props.onChange(e.target.value)} size={props.size} disabled={props.readOnly} className={props.className}>
      <Radio.Button key="editable" value="editable"><Icon icon="editIcon" hint="Editable" /></Radio.Button>
      <Radio.Button key="readOnly" value="readOnly"><Icon icon="readonlyIcon" hint="Read only" /></Radio.Button>
      <Radio.Button key="inherited" value="inherited"><Icon icon="inheritIcon" hint="Inherited" /></Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;
