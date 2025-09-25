import React, { FC } from 'react';
import { ConfigurationItemRevision } from './hooks';
import { DateDisplay } from '@/components';
import { Col, Row, Typography } from 'antd';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export interface IHistoryItemProps {
  item: ConfigurationItemRevision;
}

const { Text } = Typography;

export const HistoryItem: FC<IHistoryItemProps> = ({ item }) => {
  return (
    <div style={{ width: '100%' }}>
      <Row>
        <Col span={24}>
          <Text strong>{!isNullOrWhiteSpace(item.versionName) ? item.versionName : item.versionNo}</Text>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DateDisplay>{item.creationTime}</DateDisplay>
        </Col>
        <Col span={12}>
          {item.creatorUserName}
        </Col>
      </Row>
      {!isNullOrWhiteSpace(item.comments) && (
        <Row>
          <Col span={24}>
            <Text type="secondary">{item.comments}</Text>
          </Col>
        </Row>
      )}
    </div>
  );
};
