import { Modal } from 'antd';
import React, { FC } from 'react';
import { useMedia } from 'react-use';
import { IEntityPickerComponentProps } from '@/designer-components/entityPicker';
import { MetadataProvider, useForm } from '@/providers';
import {
  ColumnsConfiguratorProvider,
  useColumnsConfigurator,
} from '@/providers/datatableColumnsConfigurator';
import { IConfigurableColumnsBase } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsConfigurator } from './columnsConfigurator';

export interface IColumnsEditorModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  readOnly: boolean;
}

export const ColumnsEditorModalInner: FC<IColumnsEditorModal> = ({ visible, onChange, hideModal, readOnly }) => {
  const isSmall = useMedia('(max-width: 480px)');
  const { items } = useColumnsConfigurator();

  const onOkClick = () => {
    if (typeof onChange === 'function') onChange(items);
    hideModal();
  };

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={visible}
      title="Configure Columns"
      onCancel={hideModal}
      cancelText={readOnly ? 'Close' : undefined}
      okText="Save"
      onOk={onOkClick}
      okButtonProps={{ hidden: readOnly }}
    >
      <ColumnsConfigurator />
    </Modal>
  );
};

export const ColumnsEditorModal: FC<IColumnsEditorModal> = (props) => {
  const { formData } = useForm();
  let modelType = (formData as IEntityPickerComponentProps)?.entityType;
  return (
    <ColumnsConfiguratorProvider items={(props.value as IConfigurableColumnsBase[]) || []} readOnly={props.readOnly}>
      <MetadataProvider modelType={modelType}>
        <ColumnsEditorModalInner {...props} />
      </MetadataProvider>
    </ColumnsConfiguratorProvider>
  );
};

export default IColumnsEditorModal;
