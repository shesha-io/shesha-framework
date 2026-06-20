import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Tabs } from 'antd';
import { ParamsTab } from './paramsTab';
import { HeadersTab } from './headersTab';
import { BodyTab } from './bodyTab';
import { IRequestConfig } from './models';
import { useStyles } from './styles';
import { ExpressionContext, buildExpressionContextFromPaths } from '@/components/expressionEditor';
import {
  ExpressionContextTree,
  buildExpressionContextFromMetadata,
  mergeExpressionContexts,
} from '@/components/expressionEditor/contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { useMetadataOrUndefined } from '@/providers/metadata';
import { asPropertiesArray } from '@/interfaces/metadata';

export interface IRequestConfigModalProps {
  visible: boolean;
  config: IRequestConfig;
  onChange: (config: IRequestConfig) => void;
  onClose: () => void;
}

const STANDARD_CONSTANTS = [SheshaConstants.application, SheshaConstants.form];

export const RequestConfigModal: FC<IRequestConfigModalProps> = ({
  visible,
  config,
  onChange,
  onClose,
}) => {
  const { styles } = useStyles();
  const cloneConfig = (c: IRequestConfig): IRequestConfig => ({
    ...c,
    params: [...c.params],
    headers: [...c.headers],
    body: { ...c.body },
  });

  const [localConfig, setLocalConfig] = useState<IRequestConfig>(() => cloneConfig(config));
  const [activeTab, setActiveTab] = useState('params');
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setLocalConfig(cloneConfig(config));
    }
    wasVisible.current = visible;
  }, [visible, config]);

  // Build expression context once so all tabs share the same autocomplete data.
  const availableConstants = useAvailableConstantsMetadata({ standardConstants: STANDARD_CONSTANTS });
  const formMetadata = useMetadataOrUndefined()?.metadata;

  const dataPathContext = useMemo<ExpressionContext>(() => {
    const properties = asPropertiesArray(formMetadata?.properties, []);
    const paths = properties.map((p) => p.path).filter(Boolean);
    return buildExpressionContextFromPaths(paths, { additionalRoots: [] });
  }, [formMetadata]);

  const constantsContext = useAsyncMemo<ExpressionContextTree>(
    () => buildExpressionContextFromMetadata(availableConstants),
    [availableConstants],
    {},
  );

  const expressionContext = useMemo<ExpressionContext>(
    () => mergeExpressionContexts(dataPathContext, constantsContext ?? {}),
    [dataPathContext, constantsContext],
  );

  const handleOk = (): void => {
    onChange(localConfig);
    onClose();
  };

  const handleCancel = (): void => {
    setLocalConfig(cloneConfig(config));
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
      destroyOnClose
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
                  params={localConfig.params}
                  onChange={(params) => updateConfig({ params })}
                  expressionContext={expressionContext}
                />
              ),
            },
            {
              key: 'headers',
              label: 'Headers',
              children: (
                <HeadersTab
                  headers={localConfig.headers}
                  onChange={(headers) => updateConfig({ headers })}
                  expressionContext={expressionContext}
                />
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <BodyTab
                  body={localConfig.body}
                  onChange={(body) => updateConfig({ body })}
                  {...(localConfig.responseTransformation !== undefined ? { transformation: localConfig.responseTransformation } : {})}
                  onTransformationChange={(responseTransformation) => updateConfig({ responseTransformation })}
                  expressionContext={expressionContext}
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
