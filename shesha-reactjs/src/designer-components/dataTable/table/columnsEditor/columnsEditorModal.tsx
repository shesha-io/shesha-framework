import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import { useMedia } from 'react-use';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsConfigurator } from './columnsConfigurator';
import { deepCopyViaJson } from '@/utils/object';

export interface IColumnsEditorModal {
  readOnly: boolean;
  visible: boolean;
  hideModal: () => void;
  value?: ColumnsItemProps[];
  onChange?: any;
}

export const ColumnsEditorModal: FC<IColumnsEditorModal> = ({ onChange, value, visible, hideModal }) => {
  const isSmall = useMedia('(max-width: 480px)');

  const [localValue, setLocalValue] = useState<ColumnsItemProps[]>(deepCopyViaJson(value));

  const onOk = () => {
    onChange?.(localValue);
    hideModal();
  };

  const onCancel = () => {
    hideModal();
    setLocalValue(deepCopyViaJson(value));
  };

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      styles={{ body: { height: '80vh' } }}
      open={visible}
      title="Columns Configuration"
      onCancel={onCancel}
      onOk={onOk}
      destroyOnClose={true}
    >
      <ColumnsConfigurator
        readOnly={false}
        value={localValue}
        onChange={setLocalValue}
      />
    </Modal>
  );
};