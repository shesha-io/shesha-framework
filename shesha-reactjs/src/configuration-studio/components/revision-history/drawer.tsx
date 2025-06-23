import { Drawer, List, Spin } from 'antd';
import React, { FC } from 'react';
import { useActiveDoc } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { useItemRevisionHistory } from './hooks';
import { HistoryItem } from './historyItem';

export interface IRevisionHistoryProps {

}

export const RevisionHistoryDrawer: FC<IRevisionHistoryProps> = () => {
    const doc = useActiveDoc();
    const cs = useConfigurationStudio();
    const { data, isLoading } = useItemRevisionHistory(doc.itemId);

    const onClose = () => {
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
            size='large'
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