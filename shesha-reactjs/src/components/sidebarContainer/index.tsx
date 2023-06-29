import React, { FC, PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface ISidebarProps {
  /**
   * Whether it's open or not
   */
  open?: boolean;

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

  placeholder?: string;

  /**
   * Indicates whether the sidebar is in a fixed position
   */
  fixedPositon?: boolean;
}

export interface ISidebarContainerProps extends PropsWithChildren<any> {
  /**
   * Left sidebar props
   */
  leftSidebarProps?: ISidebarProps;

  /**
   * Right sidebar props
   */
  rightSidebarProps?: ISidebarProps;

  /**
   * Container header
   */
  header?: ReactNode | (() => ReactNode);

  /**
   * sidebar width. By default it's 250px
   */
  sideBarWidth?: number;

  allowFullCollapse?: boolean;
}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
}) => {
  const renderSidebar = (side: 'left' | 'right') => {
    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;

    if (!sidebarProps) return null;

    const rotation = side === 'right' ? (sidebarProps?.open ? 0 : 180) : sidebarProps?.open ? 180 : 0;

    const { open, onOpen, title, onClose, placeholder, content, fixedPositon } = sidebarProps;

    const classFixedPositon = {
      'fixed-position': fixedPositon,
      'fixed-position-right': fixedPositon && side === 'right',
    };

    return (
      <div
        className={classNames(
          `sidebar-container-${side}`,
          { open },
          { 'allow-full-collapse': allowFullCollapse },
          classFixedPositon
        )}
      >
        <div className="sidebar-header">
          <div className={`sidebar-header-title ${side}`}>{typeof title === 'function' ? title() : title}</div>
          <div className={`sidebar-header-btn ${side}`} onClick={open ? onClose : onOpen}>
            {sidebarProps.placeholder ? (
              <Tooltip title={placeholder} placement={side === 'left' ? 'right' : 'left'}>
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
          {!allowFullCollapse && <div className={classNames('sidebar-body-placeholder', { open })} />}
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar-container">
      {header && <div className="sidebar-container-header">{typeof header === 'function' ? header() : header}</div>}

      <div className="sidebar-container-body">
        {renderSidebar('left')}

        <div
          className={classNames(
            'sidebar-container-main-area scroll scroll-x',
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'allow-full-collapse': allowFullCollapse },

            { 'fixed-left-open': leftSidebarProps?.fixedPositon && leftSidebarProps?.open },
            { 'fixed-right-open': rightSidebarProps?.fixedPositon && rightSidebarProps?.open },
            { 'fixed-left-close': leftSidebarProps?.fixedPositon && !leftSidebarProps?.open },
            { 'fixed-right-close': rightSidebarProps?.fixedPositon && !rightSidebarProps?.open }
          )}
        >
          <div className="sidebar-container-main-area-body">{children}</div>
        </div>

        {renderSidebar('right')}
      </div>
    </div>
  );
};

export default SidebarContainer;
