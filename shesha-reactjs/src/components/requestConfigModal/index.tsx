import React, { FC, useState, useEffect } from 'react';
import { Modal, Tabs } from 'antd';
import { ParamsTab } from './paramsTab';
import { HeadersTab } from './headersTab';
import { BodyTab } from './bodyTab';
import { IRequestConfig } from './models';
import { useStyles } from './styles';

export interface IRequestConfigModalProps {
  visible: boolean;
  config: IRequestConfig;
  onChange: (config: IRequestConfig) => void;
  onClose: () => void;
}

export const RequestConfigModal: FC<IRequestConfigModalProps> = ({
  visible,
  config,
  onChange,
  onClose,
}) => {
  const { styles } = useStyles();
  const [localConfig, setLocalConfig] = useState<IRequestConfig>(config);
  const [activeTab, setActiveTab] = useState('params');

  // Update local config when modal opens or config prop changes
  useEffect(() => {
    if (visible) {
      setLocalConfig(config);
    }
  }, [visible, config]);

  const handleOk = () => {
    console.log('🔍 RequestConfigModal - Saving config:', localConfig);
    onChange(localConfig);
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    onClose();
  };

  const updateConfig = (updates: Partial<IRequestConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal
      title="Configure Request"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      className={styles.requestConfigModal}
      destroyOnClose={false}
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'params',
              label: 'Params',
              children: (
                <ParamsTab
                  params={localConfig.params || []}
                  onChange={params => updateConfig({ params })}
                />
              ),
            },
            {
              key: 'headers',
              label: 'Headers',
              children: (
                <HeadersTab
                  headers={localConfig.headers || []}
                  onChange={headers => updateConfig({ headers })}
                />
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <BodyTab
                  body={localConfig.body || { type: 'none', content: '' }}
                  onChange={body => updateConfig({ body })}
                />
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export * from './models';
