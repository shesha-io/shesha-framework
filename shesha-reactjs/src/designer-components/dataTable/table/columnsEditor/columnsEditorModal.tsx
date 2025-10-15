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
  parentComponentType?: string;
  value?: ColumnsItemProps[];
  onChange?: any;
}

export const ColumnsEditorModal: FC<IColumnsEditorModal> = ({ onChange, value, visible, hideModal, readOnly, parentComponentType }) => {
  const isSmall = useMedia('(max-width: 480px)');

  const [localValue, setLocalValue] = useState<ColumnsItemProps[]>(deepCopyViaJson(value));

  const onOk = (): void => {
    onChange?.(deepCopyViaJson(localValue)); // make copy of localValue to re-render table
    hideModal();
  };

  const onCancel = (): void => {
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
      destroyOnHidden={true}
    >
      <ColumnsConfigurator
        readOnly={readOnly}
        value={localValue}
        parentComponentType={parentComponentType}
        onChange={setLocalValue}
      />
    </Modal>
  );
};
