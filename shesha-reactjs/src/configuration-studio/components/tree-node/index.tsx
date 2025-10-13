import { DateDisplay } from '@/components';
import { isConfigItemTreeNode, TreeNode } from '@/configuration-studio/models';
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { Popover, Typography } from 'antd';
import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { NodeIndicator } from './nodeIndicators';
import { gray } from '@ant-design/colors';
import { useCsTreeDnd } from '@/configuration-studio/cs/hooks';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

const { Text } = Typography;

export interface ICsTreeNodeProps extends PropsWithChildren {
  node: TreeNode;
}

type LabelValueItem = {
  label: string;
  value?: ReactNode;
};

type LabelValueOrNode = LabelValueItem | ReactNode;

const isLabelValueItem = (item: LabelValueOrNode): item is LabelValueItem => isDefined(item) && typeof (item['label']) === 'string' && item['value'];

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
      result.push({ label: 'Has manual changes', value: 'yes' });
    }

    if (isDefined(node.lastModifierUser) && isDefined(node.lastModificationTime))
      result.push(<div>Last updated by {node.lastModifierUser} on <DateDisplay>{node.lastModificationTime}</DateDisplay></div>);

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
