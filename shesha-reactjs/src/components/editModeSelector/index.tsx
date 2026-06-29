import { EditMode, InteractionType } from '@/interfaces';
import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

export interface IEditModeSelectorProps {
  value?: boolean | EditMode | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: EditMode) => void) | undefined;
  onGetAdditionalInfo?: ((info: string) => void) | undefined;
  size?: SizeType | undefined;
  className?: string | undefined;
  interactionType?: InteractionType | undefined;
}

const EditModeSelector: FC<IEditModeSelectorProps> = (props) => {
  const val: EditMode = props.value === false
    ? 'disabled'
    : !isDefined(props.value) || props.value === true
      ? 'inherited'
      : props.value;

  const isFullMode = props.interactionType === 'full';

  if (typeof props.onGetAdditionalInfo === 'function') {
    return (
      <Radio.Group
        buttonStyle="solid"
        value={val}
        onChange={(e) => props.onChange?.(e.target.value as EditMode)}
        size={props.size}
        disabled={props.readOnly ?? false}
        {...(isNotNullOrWhiteSpace(props.className) ? { className: props.className } : {})}
      >
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.(isFullMode ? 'Editable' : 'Enabled')} key="editable" value="editable">
          <Icon icon="editIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.('Disabled')} key="disabled" value="disabled">
          <Icon icon="editDisableIcon" />
        </Radio.Button>
        <Radio.Button onMouseEnter={() => props.onGetAdditionalInfo?.('Read only')} key="readOnly" value="readOnly">
          <Icon icon="editLockIcon" />
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
      {...(isNotNullOrWhiteSpace(props.className) ? { className: props.className } : {})}
    >
      <Radio.Button key="editable" value="editable"><Icon icon="editIcon" hint={isFullMode ? 'Editable' : 'Enabled'} /></Radio.Button>
      <Radio.Button key="disabled" value="disabled"><Icon icon="editDisableIcon" hint="Disabled" /></Radio.Button>
      <Radio.Button key="readOnly" value="readOnly"><Icon icon="editLockIcon" hint="Read only" /></Radio.Button>
      <Radio.Button key="inherited" value="inherited"><Icon icon="inheritIcon" hint="Inherited" /></Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;
