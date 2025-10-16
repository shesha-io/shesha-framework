import { Modal } from 'antd';
import React, { FC, useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsConfigurator } from './columnsConfigurator';
import { deepCopyViaJson } from '@/utils/object';
import { useDataTableStore } from '@/providers/dataTable';
import { useMetadata } from '@/providers/metadata';
import { calculateDefaultColumns } from '../utils';

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
  const dataTableStore = useDataTableStore(false); // Don't require - modal may not be in a DataTable context
  const metadata = useMetadata(false); // Don't require - DataTable may not be in a DataSource

  const [localValue, setLocalValue] = useState<ColumnsItemProps[]>(deepCopyViaJson(value));

  // Prepopulate with default columns when modal opens if items are empty and we're in a DataTable context
  useEffect(() => {
    if (visible && dataTableStore && metadata?.metadata && (!value || value.length === 0)) {
      const defaultColumns = calculateDefaultColumns(metadata.metadata);
      if (defaultColumns.length > 0 && localValue.length === 0) {
        setLocalValue(defaultColumns);
        onChange?.(defaultColumns);
      }
    }
  }, [metadata?.metadata, visible, onChange]);

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
