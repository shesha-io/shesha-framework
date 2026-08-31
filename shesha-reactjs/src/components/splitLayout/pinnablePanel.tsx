import React, { forwardRef } from 'react';
import { Button, Divider, Space, Typography } from 'antd';
import {
  PushpinOutlined,
  PushpinFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { cx } from 'antd-style';
import { usePinnablePanelStyles } from './pinnable-panel-styles';
import { isDefined } from '@/utils';

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
  extra?: React.ReactNode;
  position?: 'start' | 'end';
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
      extra,
      position = 'start',
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
          {position === 'start' ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          <span>{title}</span>
        </div>

        {/* Expanded content */}
        <div className={cx(styles.expandedContent, "expanded-content")}>
          <div className={styles.header}>
            <Space>
              <Button
                type="text"
                icon={(expanded && position === 'start') || (!expanded && position === 'end') ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={onExpandedToggle}
                title={expanded ? 'Collapse' : 'Expand'}
              />
              <Text strong>{title}</Text>
            </Space>
            <div>
              {isDefined(extra) && <>{extra}<Divider orientation="vertical" /></>}
              <Button
                type="text"
                icon={pinned ? <PushpinFilled /> : <PushpinOutlined />}
                onClick={onPinnedToggle}
                title={pinned ? 'Unpin (auto-collapse)' : 'Pin (keep open)'}
                size="small"
              />
            </div>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    );
  },
);

PinnablePanel.displayName = 'PinnablePanel';
