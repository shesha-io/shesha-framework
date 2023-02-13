import React, { FC, ReactNode } from 'react';
import { Modal } from 'antd';
import { ToolbarConfiguratorProvider, useToolbarConfigurator } from '../../../../../providers/toolbarConfigurator';
import { ToolbarConfigurator } from './toolbarConfigurator';
import { ToolbarItemProps } from '../../../../../providers/toolbarConfigurator/models';
import { useMedia } from 'react-use';

export interface IToolbarSettingsModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  allowAddGroups?: boolean;
  render?: ReactNode | (() => ReactNode);
  title?: ReactNode | string;
  heading?: ReactNode | (() => ReactNode);
  readOnly?: boolean;
}

export const ToolbarSettingsModalInner: FC<IToolbarSettingsModal> = ({
  visible,
  onChange,
  hideModal,
  allowAddGroups,
  render,
  title = 'Configure Toolbar',
  heading,
  readOnly = false,
}) => {
  const { items } = useToolbarConfigurator();
  const isSmall = useMedia('(max-width: 480px)');

  const onOkClick = () => {
    if (typeof onChange === 'function') onChange(items);
    hideModal();
  };

  return (
    <Modal 
      width={isSmall ? '90%' : '60%'} 
      open={visible} 
      title={title} 
      okText="Save" 
      onCancel={hideModal} 
      cancelText={readOnly ? 'Close' : undefined}
      onOk={onOkClick}
      okButtonProps={{ hidden: readOnly }}
    >
      <ToolbarConfigurator allowAddGroups={allowAddGroups} heading={heading} render={render} readOnly={readOnly}/>
    </Modal>
  );
};

export const ToolbarSettingsModal: FC<IToolbarSettingsModal> = props => {
  return (
    <ToolbarConfiguratorProvider items={(props.value as ToolbarItemProps[]) || []} readOnly={props.readOnly}>
      <ToolbarSettingsModalInner {...props} />
    </ToolbarConfiguratorProvider>
  );
};

export default ToolbarSettingsModal;
