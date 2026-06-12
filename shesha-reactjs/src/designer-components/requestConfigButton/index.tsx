import React, { FC, useState } from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { RequestConfigModal, IRequestConfig } from '@/components/requestConfigModal';

export interface IRequestConfigButtonProps {
  value?: IRequestConfig;
  onChange?: (value: IRequestConfig) => void;
  readOnly?: boolean;
}

export const RequestConfigButton: FC<IRequestConfigButtonProps> = ({
  value,
  onChange,
  readOnly,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const currentConfig: IRequestConfig = value || {
    params: [],
    headers: [],
    body: { type: 'none', content: '' },
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleModalChange = (config: IRequestConfig) => {
    console.log('🔍 RequestConfigButton - Modal changed:', config);
    onChange?.(config);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const getConfigSummary = () => {
    const paramsCount = currentConfig.params?.filter(p => p.enabled).length || 0;
    const headersCount = currentConfig.headers?.filter(h => h.enabled).length || 0;
    const hasBody = currentConfig.body?.type !== 'none';

    const parts = [];
    if (paramsCount > 0) parts.push(`${paramsCount} param${paramsCount > 1 ? 's' : ''}`);
    if (headersCount > 0) parts.push(`${headersCount} header${headersCount > 1 ? 's' : ''}`);
    if (hasBody) parts.push(`body: ${currentConfig.body?.type}`);

    return parts.length > 0 ? parts.join(', ') : 'Not configured';
  };

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={handleOpenModal}
        disabled={readOnly}
        block
      >
        Configure Request
      </Button>
      <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
        {getConfigSummary()}
      </div>
      <RequestConfigModal
        visible={modalVisible}
        config={currentConfig}
        onChange={handleModalChange}
        onClose={handleModalClose}
      />
    </>
  );
};

export default RequestConfigButton;
