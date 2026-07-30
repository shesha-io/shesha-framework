import { DateDisplay } from '@/components/dateDisplay';
import { isConfigItemTreeNode, ITEM_TYPES, TreeNode } from '@/configuration-studio/models';
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { Popover, Typography } from 'antd';
import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { NodeIndicator } from './nodeIndicators';
import { gray } from '@ant-design/colors';
import { useCsTreeDnd } from '@/configuration-studio/cs/hooks';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

const { Text } = Typography;

const ITEM_TYPE_FRIENDLY_NAMES: Record<string, string> = {
  [ITEM_TYPES.FORM]: 'Form',
  [ITEM_TYPES.ROLE]: 'Role',
  [ITEM_TYPES.ENTITY]: 'Entity',
  [ITEM_TYPES.PERMISSION]: 'Permission',
  [ITEM_TYPES.REFLIST]: 'Reference list',
  [ITEM_TYPES.SETTING]: 'Setting',
  [ITEM_TYPES.NOTIFICATION]: 'Notification',
  [ITEM_TYPES.NOTIFICATION_CHANNEL]: 'Notification channel',
};

const getItemTypeFriendlyName = (itemType: string): string =>
  ITEM_TYPE_FRIENDLY_NAMES[itemType] ??
  itemType.charAt(0).toUpperCase() + itemType.slice(1).replace(/-/g, ' ');

export interface ICsTreeNodeProps extends PropsWithChildren {
  node: TreeNode;
}

type LabelValueItem = {
  label: string;
  value?: ReactNode;
};

type LabelValueOrNode = LabelValueItem | ReactNode;

const isLabelValueItem = (item: LabelValueOrNode): item is LabelValueItem => isDefined(item) && typeof (item) === "object" &&
  "label" in item && typeof (item.label) === 'string' && "value" in item && isDefined(item.value);

type LabelValueProps = {
  data: LabelValueItem;
};
const LabelValue: FC<LabelValueProps> = ({ data }) => {
  return (
    <div>
      <Text strong>{data.label}: </Text>
      <Text type="secondary">{data.value}</Text>
    </div>
  );
};

const GRAY_OUT_STYLE = { color: gray.primary };

export const CsTreeNode: FC<ICsTreeNodeProps> = ({ node, children }) => {
  const isDevMode = useIsDevMode();
  const { isDragging } = useCsTreeDnd();

  const items: LabelValueOrNode[] = useMemo(() => {
    const result: LabelValueOrNode[] = [];
    if (!isConfigItemTreeNode(node))
      return result;

    if (isDevMode)
      result.push({ label: 'Id', value: <Typography.Text copyable>{node.id}</Typography.Text> });

    if (node.flags.isExposed)
      result.push({ label: 'Exposed from', value: node.baseModule });
    if (!isNullOrWhiteSpace(node.description))
      result.push({ label: 'Description', value: node.description });
    if (node.flags.isUpdated) {
      const typeName = getItemTypeFriendlyName(node.itemType);
      const modUser = node.lastModifierUser;
      const modTime = node.lastModificationTime;
      if (modUser && modTime) {
        result.push(
          <div>
            {typeName} was last updated by {modUser} on{' '}
            <DateDisplay format="MMMM D, YYYY">{modTime}</DateDisplay> at{' '}
            <DateDisplay format="h:mm A">{modTime}</DateDisplay>
          </div>,
        );
      } else if (modUser) {
        result.push(<div>{typeName} was last updated by {modUser}</div>);
      } else if (modTime) {
        result.push(
          <div>
            {typeName} was last updated on{' '}
            <DateDisplay format="MMMM D, YYYY">{modTime}</DateDisplay> at{' '}
            <DateDisplay format="h:mm A">{modTime}</DateDisplay>
          </div>,
        );
      } else {
        result.push(<div>{typeName} has manual changes</div>);
      }
    } else {
      const modUser = node.lastModifierUser;
      const modTime = node.lastModificationTime;
      if (modUser && modTime) {
        const typeName = getItemTypeFriendlyName(node.itemType);
        result.push(
          <div>
            {typeName} was last updated by {modUser} on{' '}
            <DateDisplay format="MMMM D, YYYY">{modTime}</DateDisplay> at{' '}
            <DateDisplay format="h:mm A">{modTime}</DateDisplay>
          </div>,
        );
      }
    }

    return result;
  }, [node, isDevMode]);

  const nodeStyle = isConfigItemTreeNode(node) && !node.flags.isUpdated
    ? GRAY_OUT_STYLE
    : undefined;

  return items.length > 0 && !isDragging
    ? (
      <Popover
        content={(
          <div>
            {items.map((item, index) => (isLabelValueItem(item) ? <LabelValue key={index} data={item} /> : <React.Fragment key={index}>{item}</React.Fragment>))}
          </div>
        )}
        trigger="hover"
        placement="bottomLeft"
        mouseEnterDelay={0.4}
      >
        <span style={nodeStyle}>{children} <NodeIndicator node={node} /></span>
      </Popover>
    )
    : <span style={nodeStyle}>{children} <NodeIndicator node={node} /></span>;
};
