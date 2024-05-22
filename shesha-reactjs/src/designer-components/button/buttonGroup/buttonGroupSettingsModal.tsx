import React, { FC, Fragment, ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { useMedia } from 'react-use';
import { ButtonGroupSettingsEditor } from './buttonGroupSettingsEditor';

export interface IToolbarSettingsModal {
  readOnly: boolean;
  value?: ButtonGroupItemProps[];
  onChange?: (newValue: ButtonGroupItemProps[]) => void;
  title?: ReactNode | string;
}

interface IButtonGroupSettingsModalInnerProps extends IToolbarSettingsModal {

}

const deepCopy = <TValue = any>(value: TValue): TValue => {
  if (!value)
    return value;

  return JSON.parse(JSON.stringify(value));
};

export const ButtonGroupSettingsModal: FC<IButtonGroupSettingsModalInnerProps> = ({
  value,
  onChange,
  readOnly,
  title = 'Buttons Configuration',
}) => {
  const isSmall = useMedia('(max-width: 480px)');
  const [showModal, setShowModal] = useState(false);

  const [localValue, setLocalValue] = useState<ButtonGroupItemProps[]>(deepCopy(value));

  const openModal = () => {
    setLocalValue(deepCopy(value));
    setShowModal(true);
  };

  const onOkClick = () => {
    onChange?.(localValue);
    setShowModal(false);
  };

  const onCancelClick = () => {
    setShowModal(false);
  };

  return (
    <Fragment>
      <Button onClick={openModal}>{readOnly ? 'View Button Group' : 'Customize Button Group'}</Button>

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
        destroyOnClose={true}
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