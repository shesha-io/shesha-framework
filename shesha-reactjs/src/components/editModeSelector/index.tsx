import { EditMode } from '@/interfaces';
import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IReadOnlyModeSelectorProps {
  value?: boolean | EditMode | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: EditMode) => void) | undefined;
  onGetAdditionalInfo?: ((info: string) => void) | undefined;
  size?: SizeType | undefined;
  className?: string | undefined;
}

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = (props) => {
  const val: EditMode = props.value === false
    ? 'readOnly'
    : !props.value || props.value === true
      ? 'inherited'
      : props.value;

  if (typeof props.onGetAdditionalInfo === 'function') {
    return (
      <Radio.Group
        buttonStyle="solid"
        value={val}
        onChange={(e) => props.onChange?.(e.target.value as EditMode)}
        size={props.size}
        disabled={props.readOnly ?? false}
        {...(props.className ? { className: props.className } : {})}
      >
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.('Editable')} key="editable" value="editable">
          <Icon icon="editIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.('Read only')} key="readOnly" value="readOnly">
          <Icon icon="readonlyIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.('Inherited')} key="inherited" value="inherited">
          <Icon icon="inheritIcon" />
        </Radio.Button>
      </Radio.Group>
    );
  }

  return (
    <Radio.Group
      buttonStyle="solid"
      value={val}
      onChange={(e) => props.onChange?.(e.target.value as EditMode)}
      size={props.size}
      disabled={props.readOnly ?? false}
      {...(props.className ? { className: props.className } : {})}
    >
      <Radio.Button key="editable" value="editable"><Icon icon="editIcon" hint="Editable" /></Radio.Button>
      <Radio.Button key="readOnly" value="readOnly"><Icon icon="readonlyIcon" hint="Read only" /></Radio.Button>
      <Radio.Button key="inherited" value="inherited"><Icon icon="inheritIcon" hint="Inherited" /></Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;
