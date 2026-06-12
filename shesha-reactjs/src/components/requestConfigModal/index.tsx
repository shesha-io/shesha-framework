import React, { FC, useState, useEffect, useRef } from 'react';
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
  const wasVisible = useRef(false);

  // Seed local config from the incoming config only when the modal OPENS (false → true). Parents
  // can hand us a fresh `config` object on any re-render; re-syncing on every change would wipe
  // in-progress edits (e.g. a form-data row you just added). Edits are committed on Save.
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setLocalConfig(config);
    }
    wasVisible.current = visible;
  }, [visible, config]);

  const handleOk = (): void => {
    console.warn('🔍 RequestConfigModal - Saving config:', localConfig);
    onChange(localConfig);
    onClose();
  };

  const handleCancel = (): void => {
    setLocalConfig(config);
    onClose();
  };

  const updateConfig = (updates: Partial<IRequestConfig>): void => {
    setLocalConfig((prev) => ({ ...prev, ...updates }));
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
                  onChange={(params) => updateConfig({ params })}
                />
              ),
            },
            {
              key: 'headers',
              label: 'Headers',
              children: (
                <HeadersTab
                  headers={localConfig.headers || []}
                  onChange={(headers) => updateConfig({ headers })}
                />
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <BodyTab
                  body={localConfig.body || { type: 'none', content: '' }}
                  onChange={(body) => updateConfig({ body })}
                  transformation={localConfig.responseTransformation}
                  onTransformationChange={(responseTransformation) => updateConfig({ responseTransformation })}
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
export * from './transformationRunner';
