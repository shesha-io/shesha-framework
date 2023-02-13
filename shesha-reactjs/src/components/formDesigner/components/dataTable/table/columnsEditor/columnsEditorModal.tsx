import React, { FC } from 'react';
import { Modal } from 'antd';
import {
  ColumnsConfiguratorProvider,
  useColumnsConfigurator,
} from '../../../../../../providers/datatableColumnsConfigurator';
import { ColumnsConfigurator } from './columnsConfigurator';
import { IConfigurableColumnsBase } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { useMedia } from 'react-use';

export interface IColumnsEditorModal {
  readOnly: boolean;
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
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
      okText="Save"
      okButtonProps={{ hidden: readOnly }}
      cancelText={readOnly ? 'Close' : undefined}

      onCancel={hideModal}
      onOk={onOkClick}
    >
      <ColumnsConfigurator />
    </Modal>
  );
};

export const ColumnsEditorModal: FC<IColumnsEditorModal> = props => {
  return (
    <ColumnsConfiguratorProvider items={(props.value as IConfigurableColumnsBase[]) || []} readOnly={props.readOnly}>
      <ColumnsEditorModalInner {...props} />
    </ColumnsConfiguratorProvider>
  );
};

export default IColumnsEditorModal;
