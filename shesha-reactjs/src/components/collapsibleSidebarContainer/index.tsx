import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export interface ICollapsibleSidebarProps {
  /**
   * Whether it's open or not
   */
  open?: boolean;

  /**
   * Width of sidebar
   */
  width?: number;

  /**
   * The title
   */
  title: ReactNode | (() => ReactNode);

  /**
   * The content
   */
  content: ReactNode | (() => ReactNode);

  /**
   * What should happen when the sidebar opens
   */
  onOpen?: () => void;

  /**
   * What should happen when the sidebar closes
   */
  onClose?: () => void;

  /**
   * Tooltip foe a sidebar
   */
  tooltip?: string;
}

/**
 * A component for displaying collapsible Sidebars
 */
export interface ICollapsibleSidebarContainerProps {
  /**
   * Left sidebar props
   */
  leftSidebarProps?: ICollapsibleSidebarProps;

  /**
   * Right sidebar props
   */
  rightSidebarProps?: ICollapsibleSidebarProps;

  /**
   * Container header
   */
  header?: ReactNode | (() => ReactNode);

  /**
   * sidebar width. By default it's 250px
   */
  sideBarWidth?: number;

  /**
   * Whether this sidebar should fully collapse
   */
  allowFullCollapse?: boolean;

  /**
   * Whether there should no be padding
   */
  noPadding?: boolean;
}

export const CollapsibleSidebarContainer: FC<ICollapsibleSidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding = false,
}) => {
  const renderSidebar = (side: 'left' | 'right') => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;

    if (!sidebarProps) return null;

    const rotation = side === 'right' ? (sidebarProps?.open ? 0 : 180) : sidebarProps?.open ? 180 : 0;

    const { open, onOpen, title, onClose, tooltip, content } = sidebarProps;

    return (
      <div className={classNames(`sidebar-container-${side}`, { open }, { 'allow-full-collapse': allowFullCollapse })}>
        <div className="sidebar-header">
          <div className={`sidebar-header-title ${side}`}>{typeof title === 'function' ? title() : title}</div>
          <div className={`sidebar-header-btn ${side}`} onClick={open ? onClose : onOpen}>
            {sidebarProps.tooltip ? (
              <Tooltip title={tooltip} placement={side === 'left' ? 'right' : 'left'}>
                <RightOutlined rotate={rotation} className="toggle-open-btn" />
              </Tooltip>
            ) : (
              <RightOutlined rotate={rotation} className="toggle-open-btn" />
            )}
          </div>
        </div>
        <div className="sidebar-body scroll scroll-y">
          <div className={classNames('sidebar-body-content', { open })}>
            {typeof content === 'function' ? content() : content}
          </div>
          <div className={classNames('sidebar-body-tooltip', { open })} />
        </div>
      </div>
    );
  };

  return (
    <div className={'sidebar-container'}>
      {header && <div className="sidebar-container-header">{typeof header === 'function' ? header() : header}</div>}

      <div
        className={'sidebar-container-body'}
      >
        {renderSidebar('left')}

        <div
          className={classNames(
            'sidebar-container-main-area scroll scroll-x',
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'no-padding': noPadding },
            { 'allow-full-collapse': allowFullCollapse }
          )}
        >
          <div className="sidebar-container-main-area-body">{children}</div>
        </div>

        {renderSidebar('right')}
      </div>
    </div>
  );
};

export default CollapsibleSidebarContainer;
