import React, { FC, useState } from 'react';
import { SidebarConfigurator } from './configurator';
import { ISettingsEditorProps } from '@/components/configurableComponent';
import { ISideBarMenuProps } from '.';
import { Modal } from 'antd';
import { useMedia } from 'react-use';
import { deepCopyViaJson } from '@/utils/object';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export interface IProps extends ISettingsEditorProps<ISideBarMenuProps> {
  title?: string;
}

export const ComponentSettingsModal: FC<IProps> = ({ onSave, onCancel, title, settings }) => {
  const isSmall = useMedia('(max-width: 480px)');

  const [localValue, setLocalValue] = useState<ISidebarMenuItem[]>(deepCopyViaJson(settings.items));

  const onOk = (): void => {
    onSave({ items: localValue });
  };

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      styles={{ body: { height: '80vh' } }}
      open={true}
      title={title}
      onCancel={onCancel}
      onOk={onOk}
    >
      <SidebarConfigurator
        readOnly={false}
        value={localValue}
        onChange={setLocalValue}
      />
    </Modal>
  );
};
