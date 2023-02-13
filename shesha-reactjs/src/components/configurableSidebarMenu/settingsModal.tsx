import React, { FC, memo } from 'react';
import { Modal } from 'antd';
import { ISettingsEditorProps } from '../configurableComponent';
import { ISideBarMenuProps } from '.';
import { SidebarMenuConfiguratorProvider, useSidebarMenuConfigurator } from '../../providers/sidebarMenuConfigurator';
import SidebarConfigurator from './configurator';
import { useMedia } from 'react-use';

export interface IProps extends ISettingsEditorProps<ISideBarMenuProps> {
  title?: string;
}

export const ComponentSettingsModal: FC<IProps> = props => {
  return (
    <SidebarMenuConfiguratorProvider items={props.settings.items}>
      <ComponentSettingsModalInner {...props} />
    </SidebarMenuConfiguratorProvider>
  );
};

export const ComponentSettingsModalInner: FC<IProps> = memo(({ title, onSave, onCancel }) => {
  const { items } = useSidebarMenuConfigurator();
  const isSmall = useMedia('(max-width: 480px)');

  const onOk = () => {
    onSave({ items });
  };

  return (
    <Modal width={isSmall ? '90%' : '60%'} open={true} title={title} onCancel={onCancel} onOk={onOk}>
      <SidebarConfigurator />
    </Modal>
  );
});

export default ComponentSettingsModal;
