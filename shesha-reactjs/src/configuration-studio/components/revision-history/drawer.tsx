import { Drawer, List, Typography } from 'antd';
import React, { FC } from 'react';
import { useActiveDoc } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { useItemRevisionHistory } from './hooks';
import { HistoryItem } from './historyItem';
import { IDocumentInstance, isCIDocument } from '@/configuration-studio/models';
import { useStyles } from './styles';
import { ProductOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface IRevisionHistoryDrawerInnerProps {
  doc: IDocumentInstance;
}

const RevisionHistoryDrawerInner: FC<IRevisionHistoryDrawerInnerProps> = ({ doc }) => {
  const cs = useConfigurationStudio();
  const { styles } = useStyles();
  const { data, isLoading, mutate } = useItemRevisionHistory(doc.itemId);

  const onClose = (): void => {
    cs.hideRevisionHistoryAsync(doc.itemId);
  };

  return (
    <Drawer
      closable={true}
      destroyOnHidden={true}
      loading={isLoading}
      title="Revision History"
      placement="right"
      onClose={onClose}
      open={doc.isHistoryVisible}
      getContainer={false}
      maskClosable={false}
      mask={false}
      size="large"
    >
      {data && (
        <List
          className={styles.csRevisionsList}
          bordered
          dataSource={data.items}
          size="small"
          renderItem={(item) => item.itemType === 'subheading'
            ? (
              <List.Item className={styles.csRevisionListSubheading}>
                <ProductOutlined /> <Text strong>{item.label}</Text>
              </List.Item>
            )
            : (
              <List.Item className={styles.csRevisionListItem}>
                <HistoryItem docId={doc.itemId} revision={item} onUpdated={() => mutate()} />
              </List.Item>
            )}
        />
      )}
    </Drawer>
  );
};

export const RevisionHistoryDrawer: FC = () => {
  const doc = useActiveDoc();
  return doc && isCIDocument(doc) && doc.isHistoryVisible
    ? <RevisionHistoryDrawerInner doc={doc} />
    : undefined;
};
