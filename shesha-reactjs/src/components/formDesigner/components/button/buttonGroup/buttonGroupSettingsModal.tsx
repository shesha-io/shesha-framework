import React, { FC, Fragment, ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
import {
  ButtonGroupConfiguratorProvider,
  useButtonGroupConfigurator,
} from '../../../../../providers/buttonGroupConfigurator';
import { ButtonGroupConfigurator } from './configurator';
import { ButtonGroupItemProps } from '../../../../../providers/buttonGroupConfigurator/models';
import { useMedia } from 'react-use';

export interface IToolbarSettingsModal {
  readOnly: boolean;
  value?: object;
  onChange?: any;
  allowAddGroups?: boolean;
  render?: ReactNode | (() => ReactNode);
  title?: ReactNode | string;
  heading?: ReactNode | (() => ReactNode);
}

interface ButtonGroupSettingsModalInner extends Omit<IToolbarSettingsModal, 'readOnly'>{

}

export const ButtonGroupSettingsModalInner: FC<ButtonGroupSettingsModalInner> = ({
  onChange,
  allowAddGroups,
  render,
  title = 'Buttons Configuration',
  heading,  
}) => {
  const isSmall = useMedia('(max-width: 480px)');
  const [showModal, setShowModal] = useState(false);
  const { items, readOnly } = useButtonGroupConfigurator();

  const toggleModalVisibility = () => setShowModal(prev => !prev);

  const onOkClick = () => {
    if (typeof onChange === 'function') onChange(items);
    toggleModalVisibility();
  };

  return (
    <Fragment>
      <Button onClick={toggleModalVisibility}>{ readOnly ? 'View Button Group' : 'Customize Button Group' }</Button>

      <Modal
        width={isSmall ? '90%' : '60%'}
        open={showModal}
        title={title}
        
        onCancel={toggleModalVisibility}
        cancelText={readOnly ? 'Close' : undefined}
        
        okText="Save"
        onOk={onOkClick}
        okButtonProps={{ hidden: readOnly }}
      >
        <ButtonGroupConfigurator allowAddGroups={allowAddGroups} heading={heading} render={render} />
      </Modal>
    </Fragment>
  );
};

export const ButtonGroupSettingsModal: FC<IToolbarSettingsModal> = props => {
  return (
    <ButtonGroupConfiguratorProvider items={(props.value as ButtonGroupItemProps[]) || []} readOnly={props.readOnly}>
      <ButtonGroupSettingsModalInner {...props} />
    </ButtonGroupConfiguratorProvider>
  );
};

export default ButtonGroupSettingsModal;
