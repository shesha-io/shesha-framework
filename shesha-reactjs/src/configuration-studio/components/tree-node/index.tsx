import { DateDisplay } from '@/components';
import { isConfigItemTreeNode, TreeNode } from '@/configuration-studio/models';
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { Popover, Typography } from 'antd';
import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';

const { Text } = Typography;

export interface ICsTreeNodeProps extends PropsWithChildren {
    node: TreeNode;
}

type LabelValueItem = {
    label: string;
    value?: ReactNode;
};

type LabelValueOrNode = LabelValueItem | ReactNode;

const isLabelValueItem = (item: LabelValueOrNode): item is LabelValueItem => item && typeof (item['label']) === 'string' && item['value'];

type LabelValueProps = {
    data: LabelValueItem;
};
const LabelValue: FC<LabelValueProps> = ({ data }) => {
    return (
        <div>
            <Text strong>{data.label}: </Text>
            <Text type='secondary'>{data.value}</Text>
        </div>
    );
};

export const CsTreeNode: FC<ICsTreeNodeProps> = ({ node, children }) => {
    const isDevMode = useIsDevMode();

    const items: LabelValueOrNode[] = useMemo(() => {
        const result: LabelValueOrNode[] = [];
        if (!isConfigItemTreeNode(node))
            return result;

        if (isDevMode)
            result.push({ label: 'Id', value: <Typography.Text copyable>{node.id}</Typography.Text> });

        if (node.flags.isExposed)
            result.push({ label: 'Exposed from', value: node.baseModule });
        if (node.description)
            result.push({ label: 'Description', value: node.description });
        if (node.flags.isUpdated) {
            result.push({ label: 'Has manual changes', value: 'yes' });
        }

        if (node.lastModifierUser && node.lastModificationTime)
            result.push(<div>Last updated by {node.lastModifierUser} on <DateDisplay>{node.lastModificationTime}</DateDisplay></div>);

        return result;
    }, [node, isDevMode]);

    return items.length > 0
        ? (
            <Popover
                content={
                    <div>
                        {items.map((item, index) => (isLabelValueItem(item) ? <LabelValue key={index} data={item} /> : <React.Fragment key={index}>{item}</React.Fragment>))}
                    </div>
                }
                trigger='hover'
                mouseEnterDelay={0.3}
            >
                {children}
            </Popover>
        )
        : <>{children}</>;
};