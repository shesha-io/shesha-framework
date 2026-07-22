import React, { FC, Fragment, ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { useMedia } from 'react-use';
import { ButtonGroupSettingsEditor } from './buttonGroupSettingsEditor';
import { deepCopyViaJson } from '@/utils/object';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IToolbarSettingsModal {
  readOnly: boolean;
  value?: ButtonGroupItemProps[] | undefined;
  onChange?: ((newValue: ButtonGroupItemProps[]) => void) | undefined;
  title?: ReactNode | string | undefined;
  size?: SizeType | undefined;
  buttonText?: string | undefined;
  buttonTextReadOnly?: string | undefined;
}

interface IButtonGroupConfiguratorProps extends IToolbarSettingsModal {
  size?: SizeType | undefined;
}

export const ButtonGroupConfigurator: FC<IButtonGroupConfiguratorProps> = ({
  value,
  onChange,
  readOnly,
  size,
  title = 'Buttons Configuration',
  buttonText = 'Customize Button Group',
  buttonTextReadOnly = 'View Button Group',
}) => {
  const isSmall = useMedia('(max-width: 480px)');
  const [showModal, setShowModal] = useState(false);

  const [localValue, setLocalValue] = useState<ButtonGroupItemProps[]>(value ? deepCopyViaJson(value) : []);

  const openModal = (): void => {
    setLocalValue(value ? deepCopyViaJson(value) : []);
    setShowModal(true);
  };

  const onOkClick = (): void => {
    onChange?.(localValue);
    setShowModal(false);
  };

  const onCancelClick = (): void => {
    setShowModal(false);
  };

  return (
    <Fragment>
      <Button size={size} onClick={openModal}>{readOnly ? buttonTextReadOnly : buttonText}</Button>

      <Modal
        width={isSmall ? '90%' : '60%'}
        styles={{ body: { height: '70vh' } }}

        open={showModal}
        title={title}

        onCancel={onCancelClick}
        cancelText={readOnly ? 'Close' : undefined}

        okText="Save"
        onOk={onOkClick}
        okButtonProps={{ hidden: readOnly }}
        destroyOnHidden={true}
      >
        <ButtonGroupSettingsEditor
          readOnly={readOnly}
          value={localValue}
          onChange={setLocalValue}
        />
      </Modal>
    </Fragment>
  );
};
