import React, { FC, useEffect, useState } from 'react';
import { IMetadataEditorProps } from './interfaces';
import { Button, Modal, Space } from 'antd';
import { Show } from '@/components';
import { ApartmentOutlined } from '@ant-design/icons';
import { MetadataEditorModal } from './metadataEditorModal';
import { IModelItem } from '@/interfaces/modelConfigurator';

export const MetadataEditor: FC<IMetadataEditorProps> = (props) => {
  const { readOnly, value, onChange, label } = props;

  const [localValue, setLocalValue] = useState<IModelItem[]>(value);
  useEffect(() => {
    if (value !== localValue)
      setLocalValue(value);
  }, [value]);

  const hasValue = Boolean(value) && value.length > 0;

  const [modalVisible, setModalVisible] = useState(false);

  const onModalCancel = (): void => {
    setLocalValue(value);
    setModalVisible(false);
  };
  const onModalOk = (): void => {
    onChange(localValue);
    setModalVisible(false);
  };

  return (
    <>
      <Space>
        <Button
          icon={<ApartmentOutlined />}
          onClick={() => setModalVisible(true)}
          size="small"
        >
          {readOnly ? 'View Code' : hasValue ? 'Edit' : 'Create'}
        </Button>
        <Show when={hasValue && !readOnly}>
          <Button
            type="primary"
            size="small"
            danger
            onClick={() => onChange?.(null)}
          >
            Clear
          </Button>
        </Show>
      </Space>
      {modalVisible && (
        <Modal
          title={label ?? "Metadata Editor"}
          open={modalVisible}
          onCancel={onModalCancel}
          onOk={onModalOk}
          width="50vw"
          styles={{ body: { height: '60vh' } }}
        >
          <MetadataEditorModal {...props} value={localValue} onChange={setLocalValue} />
        </Modal>
      )}
    </>
  );
};
