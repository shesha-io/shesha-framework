import React, { FC } from 'react';
import { ConfigurationItemRevision, CreationMethod } from './hooks';
import { DateDisplay } from '@/components';
import { Button, Col, Row, Space, Typography } from 'antd';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { EditOutlined, ExportOutlined, FileZipOutlined, SettingOutlined, UndoOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';

export interface IHistoryItemProps {
  docId: string;
  revision: ConfigurationItemRevision;
  onUpdated?: () => void;
}

const { Text } = Typography;

export const HistoryItem: FC<IHistoryItemProps> = ({ revision, docId, onUpdated }) => {
  const cs = useConfigurationStudio();
  const { styles } = useStyles();

  const onRestoreClick = async (): Promise<void> => {
    const restored = await cs.restoreRevisionAsync({
      itemId: docId,
      revisionId: revision.id,
      revisionFriendlyName: revision.versionName ?? `#${revision.versionNo}`,
    });
    if (restored) {
      await cs.reloadDocumentAsync(docId);
      if (isDefined(onUpdated))
        onUpdated();
    }
  };

  const onRenameClick = async (): Promise<void> => {
    const renamed = await cs.renameItemRevisionAsync({ id: revision.id, versionName: revision.versionName });
    if (renamed && isDefined(onUpdated))
      onUpdated();
  };

  const onOpenClick = async (): Promise<void> => {
    await cs.downloadRevisionJsonAsync({ id: revision.id });
  };

  return (
    <div className={styles.csRevision}>
      <div className={styles.csRevisionContent}>
        <Row>
          <Col span={20}>
            <Space>
              <Text>#{revision.versionNo}</Text>
              {!isNullOrWhiteSpace(revision.versionName) && <Text strong>{revision.versionName}</Text>}
            </Space>
          </Col>
          <Col span={4} className={styles.csRevisionButtons}>

          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <DateDisplay>{revision.creationTime}</DateDisplay>
          </Col>
          <Col span={12}>
            {revision.creationMethod === CreationMethod.Manual && (<>{revision.creatorUserName}</>)}
            {revision.creationMethod === CreationMethod.ManualImport && (<><FileZipOutlined /> {revision.creatorUserName}</>)}
            {revision.creationMethod === CreationMethod.MigrationImport && (<><SettingOutlined /> {revision.dllVersionNo}</>)}
          </Col>
        </Row>
        {!isNullOrWhiteSpace(revision.comments) && (
          <Row>
            <Col span={24}>
              <Text type="secondary">{revision.comments}</Text>
            </Col>
          </Row>
        )}

      </div>
      {revision.isEditable && (
        <div className={styles.csRevisionButtons}>
          <Button icon={<UndoOutlined />} type="link" title="Restore" onClick={onRestoreClick} />
          <Button icon={<EditOutlined />} type="link" title="Name revision" onClick={onRenameClick} />
          <Button icon={<ExportOutlined />} type="link" title="Open" onClick={onOpenClick} />
        </div>
      )}
    </div>
  );
};
