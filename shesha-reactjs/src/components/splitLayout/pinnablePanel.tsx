import React, { forwardRef } from 'react';
import { Button, Space, Typography } from 'antd';
import {
  PushpinOutlined,
  PushpinFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { cx } from 'antd-style';
import { usePinnablePanelStyles } from './pinnable-panel-styles';

const { Text } = Typography;

export interface PinnablePanelProps {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
  onExpandedToggle: () => void;
  pinned: boolean;
  onPinnedToggle: () => void;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const PinnablePanel = forwardRef<HTMLDivElement, PinnablePanelProps>(
  (
    {
      title,
      children,
      expanded,
      onExpandedToggle,
      pinned,
      onPinnedToggle,
      direction = 'horizontal',
      className,
      style,
    },
    ref,
  ) => {
    const { styles } = usePinnablePanelStyles({ $expanded: expanded });

    const barTextClass = direction === 'horizontal' ? styles.verticalText : styles.horizontalText;

    return (
      <div ref={ref} className={cx(styles.panelContainer, className, "main-area")} style={style}>
        {/* Collapsed bar – visible when collapsed */}
        <div
          className={cx(styles.collapsedBar, barTextClass, "collapsed-bar")}
          onClick={onExpandedToggle}
        >
          <MenuUnfoldOutlined />
          <span>{title}</span>
        </div>

        {/* Expanded content */}
        <div className={cx(styles.expandedContent, "expanded-content")}>
          <div className={styles.header}>
            <Space>
              <Button
                type="text"
                icon={expanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={onExpandedToggle}
                title={expanded ? 'Collapse' : 'Expand'}
              />
              <Text strong>{title}</Text>
            </Space>
            <Button
              type="text"
              icon={pinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={onPinnedToggle}
              title={pinned ? 'Unpin (auto-collapse)' : 'Pin (keep open)'}
            />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    );
  },
);

PinnablePanel.displayName = 'PinnablePanel';
