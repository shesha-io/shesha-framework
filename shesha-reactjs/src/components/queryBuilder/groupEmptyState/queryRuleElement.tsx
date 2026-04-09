import React, { FC } from 'react';
import { FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Tooltip, Typography } from 'antd';

const { Text } = Typography;

interface IQueryRuleElementProps {
  onAddRule?: () => void;
  onAddGroup?: () => void;
  disabled?: boolean;
  addGroupDisabled?: boolean;
}

export const QueryRuleElement: FC<IQueryRuleElementProps> = ({
  onAddRule,
  onAddGroup,
  disabled,
  addGroupDisabled,
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
          disabled={disabled}
        >
          Add Rule
        </Button>
        <Tooltip title={addGroupDisabled ? 'Maximum group nesting level reached' : undefined}>
          <Button
            size="small"
            icon={<FolderOutlined />}
            onClick={onAddGroup}
            className="action action--ADD-GROUP"
            disabled={disabled || addGroupDisabled}
          >
            Add Group
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default QueryRuleElement;
