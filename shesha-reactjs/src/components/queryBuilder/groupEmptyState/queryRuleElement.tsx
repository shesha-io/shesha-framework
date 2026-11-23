import { FC } from 'react';
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
  const isDisabled = disabled ?? false;
  const groupBlocked = isDisabled || (addGroupDisabled ?? false);
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
          {...(onAddRule !== undefined ? { onClick: onAddRule } : {})}
          className="action action--ADD-RULE"
          disabled={isDisabled || onAddRule === undefined}
        >
          Add Rule
        </Button>
        <Tooltip title={addGroupDisabled === true ? 'Maximum group nesting level reached' : undefined}>
          <Button
            size="small"
            icon={<FolderOutlined />}
            {...(onAddGroup !== undefined ? { onClick: onAddGroup } : {})}
            className="action action--ADD-GROUP"
            disabled={groupBlocked || onAddGroup === undefined}
          >
            Add Group
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default QueryRuleElement;
