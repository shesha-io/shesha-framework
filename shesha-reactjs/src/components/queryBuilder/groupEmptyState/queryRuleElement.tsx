import React, { FC } from 'react';
import { FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

const { Text } = Typography;

interface IQueryRuleElementProps {
  onAddRule?: () => void;
  onAddGroup?: () => void;
}

export const QueryRuleElement: FC<IQueryRuleElementProps> = ({
  onAddRule,
  onAddGroup,
}) => {
  return (
    <Flex
      vertical
      className="sha-query-builder-empty-state-content"
    >
      <Text className="sha-query-builder-empty-state-message">No filter conditions are applied</Text>
      <Flex className="sha-query-builder-empty-state-actions">
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAddRule}
          className="action action--ADD-RULE"
        >
          Add Rule
        </Button>
        <Button
          size="small"
          icon={<FolderOutlined />}
          onClick={onAddGroup}
          className="action action--ADD-GROUP"
        >
          Add Group
        </Button>
      </Flex>
    </Flex>
  );
};

export default QueryRuleElement;
