import { Modal } from 'antd';
import { FC, useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsConfigurator } from './columnsConfigurator';
import { deepCopyViaJson } from '@/utils/object';
import { useDataTableStoreOrUndefined } from '@/providers/dataTable';
import { useMetadataOrUndefined } from '@/providers/metadata';
import { calculateDefaultColumns } from '../utils';
import { BackendRepositoryType } from '@/providers/dataTable/repository/backendRepository';

export interface IColumnsEditorModal {
  readOnly: boolean;
  visible: boolean;
  hideModal: () => void;
  parentComponentType?: string | undefined;
  value?: ColumnsItemProps[] | undefined;
  onChange?: ((value: ColumnsItemProps[]) => void) | undefined;
}

export const ColumnsEditorModal: FC<IColumnsEditorModal> = ({ onChange, value, visible, hideModal, readOnly, parentComponentType }) => {
  const isSmall = useMedia('(max-width: 480px)');
  const dataTableStore = useDataTableStoreOrUndefined(); // Don't require - modal may not be in a DataTable context
  const metadataContext = useMetadataOrUndefined(); // Don't require - DataTable may not be in a DataSource
  const metadata = metadataContext?.metadata;
  const isEntitySource = dataTableStore?.getRepository().repositoryType === BackendRepositoryType;

  const [startedEmpty, setStartedEmpty] = useState(false);
  const [localValue, setLocalValue] = useState<ColumnsItemProps[]>(deepCopyViaJson(value) ?? []);
  const [prevVisible, setPrevVisible] = useState(visible);

  // Re-seed the draft from the live model on every open; edits stay local until OK
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setLocalValue(deepCopyViaJson(value) ?? []);
      setStartedEmpty(false);
    }
  }

  // Prepopulate the draft with default columns when the modal opens on an empty entity-backed table
  useEffect(() => {
    if (visible && isEntitySource && metadata && (!value || value.length === 0)) {
      const loadDefaultColumns = async (): Promise<void> => {
        try {
          const defaultColumns = await calculateDefaultColumns(metadata);
          if (defaultColumns.length > 0 && (localValue.length === 0)) {
            setLocalValue(defaultColumns);
            setStartedEmpty(true);
          }
        } catch (error) {
          console.warn('❌ Failed to generate default columns for modal:', error);
        }
      };

      loadDefaultColumns().catch((error) => {
        console.error('Failed to fetch default columns', error);
        throw error;
      });
    }
  }, [metadata, visible, isEntitySource, value, localValue]);

  const onOk = (): void => {
    onChange?.(deepCopyViaJson(localValue)); // make copy of localValue to re-render table
    hideModal();
    if (localValue.length > 0) {
      setStartedEmpty(false);
    }
  };

  const onCancel = (): void => {
    hideModal();
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
        startedEmpty={startedEmpty}
      />
    </Modal>
  );
};
