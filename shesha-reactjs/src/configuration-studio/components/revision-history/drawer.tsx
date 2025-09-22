import { Drawer, List, Spin } from 'antd';
import React, { FC } from 'react';
import { useActiveDoc } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { useItemRevisionHistory } from './hooks';
import { HistoryItem } from './historyItem';
import { IDocumentInstance } from '@/configuration-studio/models';

export interface IRevisionHistoryDrawerInnerProps {
  doc: IDocumentInstance;
}

const RevisionHistoryDrawerInner: FC<IRevisionHistoryDrawerInnerProps> = ({ doc }) => {
  const cs = useConfigurationStudio();
  const { data, isLoading } = useItemRevisionHistory(doc.itemId);

  const onClose = (): void => {
    cs.hideRevisionHistoryAsync(doc.itemId);
  };

  return (
    <Drawer
      title="Revision History"
      placement="right"
      closable={true}
      onClose={onClose}
      open={doc.isHistoryVisible}
      getContainer={false}
      maskClosable={false}
      mask={false}
      size="large"
    >
      <Spin spinning={isLoading}>
        <List
          bordered
          dataSource={data?.revisions}
          size="small"
          renderItem={(item) => (
            <List.Item>
              <HistoryItem item={item} />
            </List.Item>
          )}
        />
      </Spin>
    </Drawer>
  );
};

export const RevisionHistoryDrawer: FC = () => {
  const doc = useActiveDoc();
  return doc
    ? <RevisionHistoryDrawerInner doc={doc} />
    : undefined;
};
