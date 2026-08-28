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
  onToggle: () => void;
  pinned: boolean;
  onPinToggle: () => void;
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
      onToggle,
      pinned,
      onPinToggle,
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
          onClick={onToggle}
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
                onClick={onToggle}
                title={expanded ? 'Collapse' : 'Expand'}
              />
              <Text strong>{title}</Text>
            </Space>
            <Button
              type="text"
              icon={pinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={onPinToggle}
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
