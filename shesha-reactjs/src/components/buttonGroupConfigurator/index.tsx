import React, { FC, Fragment, ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { useMedia } from 'react-use';
import { ButtonGroupSettingsEditor } from './buttonGroupSettingsEditor';
import { deepCopyViaJson } from '@/utils/object';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IToolbarSettingsModal {
  readOnly: boolean;
  value?: ButtonGroupItemProps[];
  onChange?: (newValue: ButtonGroupItemProps[]) => void;
  title?: ReactNode | string;
  size?: SizeType;
}

interface IButtonGroupConfiguratorProps extends IToolbarSettingsModal {
  size?: SizeType;
}

export const ButtonGroupConfigurator: FC<IButtonGroupConfiguratorProps> = ({
  value,
  onChange,
  readOnly,
  size,
  title = 'Buttons Configuration',
}) => {
  const isSmall = useMedia('(max-width: 480px)');
  const [showModal, setShowModal] = useState(false);

  const [localValue, setLocalValue] = useState<ButtonGroupItemProps[]>(deepCopyViaJson(value));

  const openModal = (): void => {
    setLocalValue(deepCopyViaJson(value));
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
      <Button size={size} onClick={openModal}>{readOnly ? 'View Button Group' : 'Customize Button Group'}</Button>

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
