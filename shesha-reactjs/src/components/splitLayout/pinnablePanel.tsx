import React, { forwardRef, ReactNode } from 'react';
import { Button, Divider, Space, Typography } from 'antd';
import {
  PushpinOutlined,
  PushpinFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { cx } from 'antd-style';
import { usePinnablePanelStyles } from './pinnable-panel-styles';
import { isDefined } from '@/utils';

const { Text } = Typography;

export interface PinnablePanelProps {
  title: ReactNode | (() => React.ReactNode) | undefined;
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

    const renderTitle = (defaultRender: (stringTitle: ReactNode) => ReactNode): ReactNode =>
      !isDefined(title)
        ? undefined
        : typeof (title) === 'function'
          ? title()
          : defaultRender(title);

    return (
      <div ref={ref} className={cx(styles.panelContainer, className, "main-area")} style={style}>
        {/* Collapsed bar – visible when collapsed */}
        <div
          className={cx(styles.collapsedBar, barTextClass, "collapsed-bar")}
          onClick={onExpandedToggle}
        >
          {direction === 'horizontal'
            ? position === 'start'
              ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            : <RightOutlined />}

          {renderTitle((str) => <span>{str}</span>)}
        </div>

        {/* Expanded content */}
        <div className={cx(styles.expandedContent, "expanded-content")}>
          <div className={styles.header}>
            <Space>
              <Button
                type="text"
                icon={direction === 'horizontal'
                  ? position === 'start'
                    ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
                  : <DownOutlined />}
                onClick={onExpandedToggle}
                title={expanded ? 'Collapse' : 'Expand'}
              />
              {renderTitle((str) => <Text strong>{str}</Text>)}
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
